/// <reference types="node" />

/**
 * Generador de artículos MDX a partir de un video de YouTube.
 *
 * Uso:
 *   YT_API_KEY=... GEMINI_API_KEY=... \
 *     npx tsx scripts/generate-article.ts <videoId> <categoria> [--transcript-file ./ruta.txt]
 *
 * Categorías válidas: Reviews | Entrevistas | Análisis | "Detrás de cámaras"
 *
 * Requisitos adicionales (instalar solo cuando vayas a usar el script):
 *   npm i -D tsx
 *   npm i youtube-transcript @google/generative-ai
 *
 * El script:
 *   1. Pide metadatos del video a la YouTube Data API.
 *   2. Descarga la transcripción por OAuth (captions API), o lee archivo manual.
 *   3. Si OAuth falla, usa `youtube-transcript` como fallback.
 *   3. Normaliza timestamps para que las citas queden sincronizadas con el video.
 *   4. Llama a Gemini con el prompt maestro para obtener un artículo de ≥600 palabras.
 *   5. Escribe el MDX en content/articulos/<slug>.mdx con cover = thumbnail YT.
 *
 * No publica nada automáticamente: solo deja el fichero en disco para revisión
 * editorial antes de commitearlo.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawnSync } from "node:child_process";
import os from "node:os";

type Category = "Reviews" | "Entrevistas" | "Análisis" | "Detrás de cámaras";
interface TranscriptChunk {
  offset: number | null;
  duration: number | null;
  text: string;
}

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

interface CaptionItem {
  id: string;
  snippet?: {
    language?: string;
    trackKind?: string;
    isDraft?: boolean;
  };
}

const CATEGORIES: Category[] = [
  "Reviews",
  "Entrevistas",
  "Análisis",
  "Detrás de cámaras",
];

const MASTER_PROMPT = `Actúa como un redactor Senior especializado en SEO y blogs de deporte y entretenimiento.

Tu tarea: Convertir la siguiente transcripción de video en un artículo de blog profundo, útil y fácil de leer en español.

Reglas críticas:
1. No resumas: transforma la información en una guía o artículo de opinión.
2. Tono: conversacional, cercano y profesional. Evita frases como "En este video vemos...". Usa "Hoy vamos a analizar...".
3. Estructura: usa estrictamente H2 (##) y H3 (###) en Markdown para dividir el contenido.
4. Dato de valor: extrae los 3 puntos más importantes del video y preséntalos en una lista con viñetas (-).
5. SEO: incluye la palabra clave principal en el primer párrafo y en al menos un encabezado.
6. Longitud mínima: 600 palabras. Si la transcripción es corta, expande los conceptos con conocimiento general relevante.
7. Si el texto fuente trae marcas de tiempo, úsalas para anclar citas y momentos clave.
8. Si el material es una entrevista, añade una sección final "Citas destacadas" con 3 a 5 citas breves y su timestamp.
9. Redacción normativa: aplica ortografía, puntuación y gramática según la RAE; evita muletillas y repeticiones.
10. Capitalización en español: en títulos y subtítulos usa mayúscula solo al inicio y en nombres propios/siglas; evita Title Case en inglés y MAYÚSCULAS sostenidas.
11. Devuelve SOLO el cuerpo del artículo en Markdown, sin front-matter y sin comentarios.

Transcripción:
---
{{TRANSCRIPT}}
---`;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function canUseOAuthCaptions(): boolean {
  const oauthDisabled = process.env.YT_OAUTH_DISABLE?.trim().toLowerCase() === "true";
  if (oauthDisabled) return false;

  return Boolean(
    process.env.YT_OAUTH_CLIENT_ID
      && process.env.YT_OAUTH_CLIENT_SECRET
      && process.env.YT_OAUTH_REFRESH_TOKEN,
  );
}

function canUseWhisper(): boolean {
  const value = process.env.WHISPER_ENABLED;
  if (!value) return false;
  return value.trim().toLowerCase() === "true";
}

function readNonEmptyEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") return fallback;
  return value;
}

function parseSrtTime(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const millis = Number(match[4]);
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
}

function parseSrtTranscript(srtText: string): TranscriptChunk[] {
  const blocks = srtText.replace(/\r/g, "").split(/\n\n+/);
  const chunks: TranscriptChunk[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) continue;

    const timelineIndex = lines.findIndex((line) => line.includes("-->"));
    if (timelineIndex === -1) continue;

    const timeline = lines[timelineIndex];
    const timeMatch = timeline.match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/,
    );
    if (!timeMatch) continue;

    const start = parseSrtTime(timeMatch[1]);
    const end = parseSrtTime(timeMatch[2]);
    const text = lines
      .slice(timelineIndex + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text || start === null) continue;

    chunks.push({
      offset: start,
      duration: end !== null && end > start ? end - start : null,
      text,
    });
  }

  return chunks;
}

export function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function normalizeOffset(offset: number): number {
  return offset > 1000 ? offset / 1000 : offset;
}

export function parseTimestampToken(token: string): number | null {
  const compactMatch = token.match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/);
  if (compactMatch) {
    const hours = Number(compactMatch[1] ?? 0);
    const minutes = Number(compactMatch[2]);
    const seconds = Number(compactMatch[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const spokenMatch = token.match(
    /^(\d+)\s*minuto[s]?\s*y\s*(\d+)\s*segundo[s]?$/i,
  );
  if (spokenMatch) {
    return Number(spokenMatch[1]) * 60 + Number(spokenMatch[2]);
  }

  const secondsMatch = token.match(/^(\d+)\s*segundo[s]?$/i);
  if (secondsMatch) {
    return Number(secondsMatch[1]);
  }

  return null;
}

export function cleanTranscriptText(rawText: string): string {
  return rawText
    .replace(/^\s*(?:\d{1,2}:\d{2}(?::\d{2})?|\d+\s*minuto[s]?\s*y\s*\d+\s*segundo[s]?)\s*/i, "")
    .replace(/^\s*\d+\s*(?:segundo[s]?|seconds?)\s*/i, "")
    .replace(/^\s*(?:segundo[s]?|seconds?)\s*/i, "")
    .replace(/^\s*\d+\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTranscriptText(source: string): TranscriptChunk[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const timeTokenMatch = line.match(
        /^(?:\d{1,2}:\d{2}(?::\d{2})?|\d+\s*minuto[s]?\s*y\s*\d+\s*segundo[s]?|\d+\s*segundo[s]?)/i,
      );

      if (!timeTokenMatch) {
        return {
          offset: null,
          duration: null,
          text: line,
        } as TranscriptChunk;
      }

      const offset = parseTimestampToken(timeTokenMatch[0]);
      const text = cleanTranscriptText(line.slice(timeTokenMatch[0].length));

      return {
        offset,
        duration: null,
        text: text || line,
      } as TranscriptChunk;
    })
    .filter((chunk) => chunk.text.length > 0);
}

export function transcriptChunksToPrompt(chunks: TranscriptChunk[]): string {
  return chunks
    .map((chunk) => {
      if (chunk.offset === null) {
        return chunk.text;
      }

      return `[${formatTimestamp(chunk.offset)}] ${chunk.text}`;
    })
    .join("\n");
}

export function parseScriptArgs(argv: string[]) {
  const positionals: string[] = [];
  let transcriptFilePath: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--transcript-file") {
      transcriptFilePath = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--transcript-file=")) {
      transcriptFilePath = arg.split("=")[1];
      continue;
    }

    positionals.push(arg);
  }

  return {
    videoId: positionals[0],
    category: positionals[1],
    transcriptFilePath: transcriptFilePath || process.env.TRANSCRIPT_FILE,
  };
}

async function refreshOAuthAccessToken(): Promise<string> {
  const clientId = process.env.YT_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YT_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.YT_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Faltan variables OAuth para leer captions");
  }

  const payload = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`No se pudo refrescar access token OAuth: ${text}`);
  }

  const tokenData = (await tokenRes.json()) as OAuthTokenResponse;
  return tokenData.access_token;
}

function chooseCaptionTrack(items: CaptionItem[]): CaptionItem | null {
  if (!items.length) return null;

  const sorted = [...items].sort((a, b) => {
    const langA = a.snippet?.language ?? "";
    const langB = b.snippet?.language ?? "";

    const score = (item: CaptionItem) => {
      const lang = item.snippet?.language ?? "";
      let points = 0;

      if (lang === "es") points += 200;
      else if (lang.startsWith("es")) points += 150;
      else if (lang === "en") points += 50;

      if (item.snippet?.trackKind !== "asr") points += 25;
      if (!item.snippet?.isDraft) points += 10;

      return points;
    };

    return score(b) - score(a) || langA.localeCompare(langB);
  });

  return sorted[0] ?? null;
}

async function fetchTranscriptViaOAuth(videoId: string): Promise<TranscriptChunk[]> {
  const accessToken = await refreshOAuthAccessToken();

  const listUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(`No se pudieron listar captions por OAuth: ${text}`);
  }

  const data = (await listRes.json()) as { items?: CaptionItem[] };
  const selected = chooseCaptionTrack(data.items ?? []);
  if (!selected) {
    throw new Error("No hay pistas de captions disponibles en este video");
  }

  const downloadUrl = `https://www.googleapis.com/youtube/v3/captions/${selected.id}?tfmt=srt&alt=media`;
  const downloadRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!downloadRes.ok) {
    const text = await downloadRes.text();
    throw new Error(`No se pudo descargar captions por OAuth: ${text}`);
  }

  const srtText = await downloadRes.text();
  const chunks = parseSrtTranscript(srtText);
  if (!chunks.length) {
    throw new Error("La descarga de captions devolvió texto sin bloques parseables");
  }

  return chunks;
}

async function fetchVideoMeta(videoId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error("Video no encontrado");
  return {
    title: item.snippet.title as string,
    description: item.snippet.description as string,
    publishedAt: item.snippet.publishedAt as string,
    thumbnail:
      (item.snippet.thumbnails?.maxres?.url as string | undefined) ??
      (item.snippet.thumbnails?.high?.url as string) ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

async function fetchTranscriptViaWhisper(videoId: string): Promise<TranscriptChunk[]> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "walka-whisper-"));
  const outputPath = path.join(tempDir, `${videoId}.txt`);

  const model = readNonEmptyEnv("WHISPER_MODEL", "small");
  const language = readNonEmptyEnv("WHISPER_LANGUAGE", "es");
  const maxAudioMinutes = readNonEmptyEnv("WHISPER_MAX_AUDIO_MINUTES", "75");

  try {
    const command = spawnSync(
      "python3",
      [
        "scripts/transcribe-whisper.py",
        "--video-id",
        videoId,
        "--output",
        outputPath,
        "--model",
        model,
        "--language",
        language,
        "--max-audio-minutes",
        maxAudioMinutes,
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: "utf8",
      },
    );

    if (command.status !== 0) {
      throw new Error(
        (command.stderr || command.stdout || "Whisper finalizo con error").trim(),
      );
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error("Whisper no genero archivo de salida");
    }

    const rawTranscript = fs.readFileSync(outputPath, "utf8");
    const chunks = parseTranscriptText(rawTranscript);

    if (!chunks.length) {
      throw new Error("Whisper devolvio una transcripcion vacia");
    }

    return chunks;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function fetchTranscript(videoId: string, transcriptFilePath?: string): Promise<TranscriptChunk[]> {
  if (transcriptFilePath) {
    const resolvedPath = path.resolve(transcriptFilePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`No existe el archivo de transcripción: ${resolvedPath}`);
    }

    const rawTranscript = fs.readFileSync(resolvedPath, "utf8");
    const chunks = parseTranscriptText(rawTranscript);

    if (!chunks.length) {
      throw new Error(
        `El archivo de transcripción ${resolvedPath} está vacío o no tiene texto utilizable.`,
      );
    }

    return chunks;
  }

  if (canUseOAuthCaptions()) {
    try {
      return await fetchTranscriptViaOAuth(videoId);
    } catch (oauthError) {
      console.warn(
        `OAuth captions falló (${oauthError instanceof Error ? oauthError.message : String(oauthError)}), uso fallback youtube-transcript...`,
      );
    }
  }

  try {
    const parts = await YoutubeTranscript.fetchTranscript(videoId);
    return parts.map((part) => ({
      offset: normalizeOffset(part.offset),
      duration: normalizeOffset(part.duration),
      text: part.text,
    }));
  } catch (youtubeTranscriptError) {
    if (canUseWhisper()) {
      try {
        console.warn("youtube-transcript falló, uso fallback Whisper local...");
        return await fetchTranscriptViaWhisper(videoId);
      } catch (whisperError) {
        throw new Error(
          `No fue posible obtener transcripción automática del video ${videoId}. `
          + `OAuth no pudo descargar captions, youtube-transcript falló y Whisper también falló. `
          + `Detalle youtube-transcript: ${youtubeTranscriptError instanceof Error ? youtubeTranscriptError.message : String(youtubeTranscriptError)}. `
          + `Detalle Whisper: ${whisperError instanceof Error ? whisperError.message : String(whisperError)}`,
        );
      }
    }

    throw new Error(
      `No fue posible obtener transcripción automática del video ${videoId}. `
      + `OAuth no pudo descargar captions y youtube-transcript también falló. `
      + `Opciones: (1) usar --transcript-file con texto/SRT manual, `
      + `(2) autorizar con la cuenta propietaria del canal, `
      + `(3) subir subtítulos manuales (no ASR) en YouTube Studio, `
      + `(4) habilitar WHISPER_ENABLED=true para usar transcripción local. `
      + `Detalle fallback: ${youtubeTranscriptError instanceof Error ? youtubeTranscriptError.message : String(youtubeTranscriptError)}`,
    );
  }
}

async function generateArticle(transcript: string, geminiKey: string) {
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = MASTER_PROMPT.replace("{{TRANSCRIPT}}", transcript);
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

function extractExcerpt(markdown: string): string {
  const firstPara = markdown
    .split(/\n\n+/)
    .find((block) => !block.startsWith("#"));
  return (firstPara ?? "").replace(/\s+/g, " ").slice(0, 220);
}

async function main() {
  const { videoId, category: rawCategory, transcriptFilePath } = parseScriptArgs(process.argv.slice(2));
  if (!videoId) {
    console.error(
      "Uso: tsx scripts/generate-article.ts <videoId> [categoria] [--transcript-file ./ruta.txt]",
    );
    process.exit(1);
  }
  const category: Category = (CATEGORIES.includes(rawCategory as Category)
    ? (rawCategory as Category)
    : "Análisis");

  const ytKey =
    process.env.YT_API_KEY ?? process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!ytKey)
    throw new Error(
      "Falta YT_API_KEY (o NEXT_PUBLIC_YOUTUBE_API_KEY) en el entorno",
    );
  if (!geminiKey) throw new Error("Falta GEMINI_API_KEY");

  console.log(`Obteniendo metadatos de ${videoId}…`);
  const meta = await fetchVideoMeta(videoId, ytKey);

  console.log(transcriptFilePath ? "Leyendo transcripción manual…" : "Descargando transcripción…");
  const transcriptChunks = await fetchTranscript(videoId, transcriptFilePath);
  const transcript = transcriptChunksToPrompt(transcriptChunks);
  if (transcript.length < 300) {
    console.warn(
      "La transcripción es muy corta; el artículo podría no llegar a 600 palabras.",
    );
  }

  console.log("Generando artículo con Gemini…");
  const body = await generateArticle(transcript, geminiKey);

  const slug = slugify(meta.title);
  const excerpt = extractExcerpt(body);
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(meta.title)}`,
    `slug: ${JSON.stringify(slug)}`,
    `date: ${JSON.stringify(new Date().toISOString().slice(0, 10))}`,
    `author: "Equipo Walka TV"`,
    `category: ${JSON.stringify(category)}`,
    `excerpt: ${JSON.stringify(excerpt)}`,
    `cover: ${JSON.stringify(meta.thumbnail)}`,
    `videoId: ${JSON.stringify(videoId)}`,
    "---",
    "",
  ].join("\n");

  const outDir = path.join(process.cwd(), "content", "articulos");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${slug}.mdx`);
  if (fs.existsSync(outFile)) {
    console.error(`Ya existe ${outFile}. Aborto.`);
    process.exit(2);
  }
  fs.writeFileSync(outFile, `${frontmatter}${body}\n`, "utf8");
  console.log(`✅ Escrito ${outFile}`);
  console.log(
    "Revisa el artículo manualmente antes de hacer commit. Ajusta el excerpt si hace falta.",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
