/// <reference types="node" />

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";

type Category = "Reviews" | "Entrevistas" | "Análisis" | "Detrás de cámaras";

interface PlaylistItem {
  videoId: string;
  publishedAt: string;
  title?: string;
}

interface VideoStats {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface RankedVideo extends VideoStats {
  score: number;
}

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

function requireEnvOrFallback(primary: string, fallback?: string): string {
  const value = process.env[primary] ?? (fallback ? process.env[fallback] : undefined);
  if (!value) {
    throw new Error(
      `Falta variable de entorno: ${primary}${fallback ? ` (o ${fallback})` : ""}`,
    );
  }
  return value;
}

function optionalEnv(primary: string, fallback?: string): string | undefined {
  const value = process.env[primary] ?? (fallback ? process.env[fallback] : undefined);
  if (!value || value.trim() === "") return undefined;
  return value;
}

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  return raw.toLowerCase() !== "false";
}

function readCategoryEnv(name: string, fallback: Category): Category {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;

  const allowed: Category[] = [
    "Reviews",
    "Entrevistas",
    "Análisis",
    "Detrás de cámaras",
  ];

  return allowed.includes(raw as Category) ? (raw as Category) : fallback;
}

function getConfig() {
  const ytApiKey = optionalEnv("YT_API_KEY", "NEXT_PUBLIC_YOUTUBE_API_KEY");
  const channelId = requireEnvOrFallback("YT_CHANNEL_ID", "NEXT_PUBLIC_YOUTUBE_CHANNEL_ID");

  const lookbackDays = Math.max(1, readNumberEnv("WEEKLY_LOOKBACK_DAYS", 7));
  const topN = Math.max(1, readNumberEnv("WEEKLY_TOP_N", 3));
  const minViews = Math.max(0, readNumberEnv("WEEKLY_MIN_VIEWS", 0));
  const maxAttempts = Math.max(
    topN,
    readNumberEnv("WEEKLY_MAX_ATTEMPTS", topN * 4),
  );
  const failIfNoneGenerated = readBooleanEnv("WEEKLY_FAIL_IF_NONE_GENERATED", false);
  const defaultCategory = readCategoryEnv("WEEKLY_DEFAULT_CATEGORY", "Análisis");
  const excludeShorts = readBooleanEnv("WEEKLY_EXCLUDE_SHORTS", true);

  return {
    ytApiKey,
    channelId,
    lookbackDays,
    topN,
    minViews,
    maxAttempts,
    failIfNoneGenerated,
    defaultCategory,
    excludeShorts,
  };
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match?.[1]) return undefined;
  return decodeXmlText(match[1].trim());
}

async function fetchRecentItemsViaRss(channelId: string, minDate: Date): Promise<PlaylistItem[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se pudo leer feed RSS del canal (${res.status})`);
  }

  const xml = await res.text();
  const entryBlocks = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const items: PlaylistItem[] = [];

  for (const block of entryBlocks) {
    const videoId = parseRssTag(block, "yt:videoId");
    const publishedAt = parseRssTag(block, "published");
    const title = parseRssTag(block, "title");

    if (!videoId || !publishedAt) continue;

    const date = new Date(publishedAt);
    if (Number.isNaN(date.getTime())) continue;
    if (date < minDate) continue;

    items.push({ videoId, publishedAt, title });
  }

  return items;
}

function buildVideoStatsFromItems(items: PlaylistItem[]): VideoStats[] {
  return items.map((item, index) => ({
    id: item.videoId,
    title: item.title ?? item.videoId,
    description: "",
    publishedAt: item.publishedAt,
    duration: "PT10M",
    // Mantiene prioridad de más reciente cuando no hay métricas reales.
    viewCount: items.length - index,
    likeCount: 0,
    commentCount: 0,
  }));
}

function parseDurationToSeconds(isoDuration: string): number {
  const match = isoDuration.match(
    /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/,
  );

  if (!match) return 0;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function inferCategory(video: VideoStats, fallback: Category): Category {
  const haystack = `${video.title} ${video.description}`.toLowerCase();

  if (/(entrevista|charla|conversaci[oó]n|invitad[oa])/.test(haystack)) {
    return "Entrevistas";
  }

  if (/(review|rese[nñ]a|probamos|testeo)/.test(haystack)) {
    return "Reviews";
  }

  if (/(detr[aá]s de c[aá]maras|backstage|making of|c[oó]mo se hizo)/.test(haystack)) {
    return "Detrás de cámaras";
  }

  return fallback;
}

function getExistingVideoIds(): Set<string> {
  const dir = path.join(process.cwd(), "content", "articulos");
  if (!fs.existsSync(dir)) return new Set();

  const ids = new Set<string>();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);
    if (data.videoId && typeof data.videoId === "string") {
      ids.add(data.videoId);
    }
  }

  return ids;
}

async function fetchUploadsPlaylistId(channelId: string, key: string): Promise<string> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo obtener channel details (${res.status})`);
  const data = await res.json();

  const uploads = data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads as
    | string
    | undefined;
  if (!uploads) throw new Error("No se encontró uploads playlist en el canal");
  return uploads;
}

async function fetchRecentPlaylistItems(
  uploadsPlaylistId: string,
  key: string,
  minDate: Date,
): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = [];
  let pageToken: string | undefined;

  while (true) {
    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      maxResults: "50",
      playlistId: uploadsPlaylistId,
      key,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    if (!res.ok) {
      throw new Error(`No se pudieron listar videos recientes (${res.status})`);
    }
    const data = await res.json();
    const pageItems = data?.items ?? [];

    if (!Array.isArray(pageItems) || pageItems.length === 0) break;

    let reachedOldVideo = false;

    for (const item of pageItems) {
      const videoId =
        item?.contentDetails?.videoId
        ?? item?.snippet?.resourceId?.videoId;
      const publishedAt = item?.contentDetails?.videoPublishedAt ?? item?.snippet?.publishedAt;

      if (!videoId || !publishedAt) continue;

      const date = new Date(publishedAt);
      if (date < minDate) {
        reachedOldVideo = true;
        continue;
      }

      items.push({ videoId, publishedAt });
    }

    if (reachedOldVideo) break;

    pageToken = data?.nextPageToken as string | undefined;
    if (!pageToken) break;
  }

  return items;
}

async function fetchVideoStats(ids: string[], key: string): Promise<VideoStats[]> {
  const all: VideoStats[] = [];

  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "snippet,statistics,contentDetails",
      id: chunk.join(","),
      key,
    });

    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!res.ok) {
      throw new Error(`No se pudieron obtener estadísticas de videos (${res.status})`);
    }

    const data = await res.json();
    const items = data?.items ?? [];

    for (const item of items) {
      const id = item?.id as string | undefined;
      if (!id) continue;

      all.push({
        id,
        title: String(item?.snippet?.title ?? id),
        description: String(item?.snippet?.description ?? ""),
        publishedAt: String(item?.snippet?.publishedAt ?? ""),
        duration: String(item?.contentDetails?.duration ?? "PT0S"),
        viewCount: Number(item?.statistics?.viewCount ?? 0),
        likeCount: Number(item?.statistics?.likeCount ?? 0),
        commentCount: Number(item?.statistics?.commentCount ?? 0),
      });
    }
  }

  return all;
}

function rankVideos(videos: VideoStats[]): RankedVideo[] {
  return videos
    .map((video) => ({
      ...video,
      score: video.viewCount + video.likeCount * 6 + video.commentCount * 10,
    }))
    .sort((a, b) => b.score - a.score || b.viewCount - a.viewCount);
}

function runGenerator(videoId: string, category: Category): boolean {
  const result = spawnSync(
    "npx",
    ["tsx", "scripts/generate-article.ts", videoId, category],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    },
  );

  return result.status === 0;
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));
  const config = getConfig();

  const minDate = new Date(Date.now() - config.lookbackDays * 24 * 60 * 60 * 1000);
  const existingVideoIds = getExistingVideoIds();

  console.log(`Analizando videos del canal en los últimos ${config.lookbackDays} días...`);

  let recentItems: PlaylistItem[] = [];
  if (config.ytApiKey) {
    try {
      const uploadsPlaylistId = await fetchUploadsPlaylistId(config.channelId, config.ytApiKey);
      recentItems = await fetchRecentPlaylistItems(uploadsPlaylistId, config.ytApiKey, minDate);
    } catch (error) {
      console.warn(
        `No se pudo listar por YouTube Data API (${error instanceof Error ? error.message : String(error)}). `
        + "Uso fallback RSS del canal...",
      );
      recentItems = await fetchRecentItemsViaRss(config.channelId, minDate);
    }
  } else {
    console.warn("YT_API_KEY no está definida; uso fallback RSS del canal.");
    recentItems = await fetchRecentItemsViaRss(config.channelId, minDate);
  }

  if (recentItems.length === 0) {
    console.log("No hay videos recientes en la ventana semanal.");
    return;
  }

  const uniqueIds = [...new Set(recentItems.map((item) => item.videoId))];
  let videos: VideoStats[];
  if (config.ytApiKey) {
    try {
      videos = await fetchVideoStats(uniqueIds, config.ytApiKey);
    } catch (error) {
      console.warn(
        `No se pudieron obtener estadísticas por API (${error instanceof Error ? error.message : String(error)}). `
        + "Uso metadatos mínimos para continuar.",
      );
      videos = buildVideoStatsFromItems(recentItems);
    }
  } else {
    videos = buildVideoStatsFromItems(recentItems);
  }

  const candidates = rankVideos(videos).filter((video) => {
    const isExisting = existingVideoIds.has(video.id);
    const hasMinViews = video.viewCount >= config.minViews;
    const isShort = parseDurationToSeconds(video.duration) < 70;

    if (isExisting) return false;
    if (!hasMinViews) return false;
    if (config.excludeShorts && isShort) return false;

    return true;
  });

  if (!candidates.length) {
    console.log("No hay candidatos nuevos (sin duplicados) para generar esta semana.");
    return;
  }

  console.log("Top candidatos semanales:");
  candidates.slice(0, Math.max(config.topN, 10)).forEach((video, idx) => {
    console.log(
      `${idx + 1}. ${video.title} (${video.id}) views=${video.viewCount} likes=${video.likeCount} comments=${video.commentCount}`,
    );
  });

  if (dryRun) {
    console.log("Dry run activo: no se generaron artículos.");
    return;
  }

  let generated = 0;
  const failures: string[] = [];
  const attempts = candidates.slice(0, config.maxAttempts);

  console.log(
    `Intentos máximos en esta corrida: ${config.maxAttempts} (objetivo de artículos: ${config.topN})`,
  );

  for (const video of attempts) {
    if (generated >= config.topN) break;

    const category = inferCategory(video, config.defaultCategory);
    console.log(`\nGenerando artículo para ${video.id} (${category})...`);

    const ok = runGenerator(video.id, category);
    if (ok) {
      generated += 1;
      continue;
    }

    failures.push(video.id);
  }

  console.log("\nResumen semanal:");
  console.log(`- generados: ${generated}`);
  console.log(`- objetivo: ${config.topN}`);
  console.log(`- intentos: ${attempts.length}`);
  console.log(`- fallidos: ${failures.length}`);
  if (failures.length) {
    console.log(`- ids fallidos: ${failures.join(", ")}`);
  }

  if (generated === 0) {
    const message =
      "No se pudo generar ningún artículo automático en esta ejecución (transcripción no disponible en videos candidatos).";

    if (config.failIfNoneGenerated) {
      throw new Error(message);
    }

    console.warn(`⚠️ ${message}`);
    console.warn("El workflow termina en éxito para reintentar en la próxima ventana semanal.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
