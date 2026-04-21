import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type Category =
  | "Reviews"
  | "Entrevistas"
  | "Análisis"
  | "Detrás de cámaras";

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  category: Category;
  cover: string;
  videoId?: string;
  readingMinutes: number;
}

export interface Article extends ArticleMeta {
  content: string;
}

const ARTICLES_DIR = path.join(process.cwd(), "content", "articulos");

function readAll(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const now = Date.now();
  const articles: Article[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug =
      (data.slug as string | undefined) ?? file.replace(/\.(mdx|md)$/i, "");
    const minutes = Math.max(1, Math.round(readingTime(content).minutes));
    return {
      slug,
      title: String(data.title ?? slug),
      excerpt: String(data.excerpt ?? ""),
      date: new Date(data.date ?? Date.now()).toISOString(),
      author: String(data.author ?? "Equipo Walka TV"),
      category: (data.category as Category) ?? "Análisis",
      cover: String(data.cover ?? ""),
      videoId: data.videoId ? String(data.videoId) : undefined,
      readingMinutes: minutes,
      content,
    };
  });

  return articles
    .filter((a) => new Date(a.date).getTime() <= now)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllArticles(): ArticleMeta[] {
  return readAll().map(({ content: _content, ...meta }) => meta);
}

export function getArticleBySlug(slug: string): Article | null {
  return readAll().find((a) => a.slug === slug) ?? null;
}

export function getArticlesByCategory(category: Category): ArticleMeta[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getRelated(slug: string, limit = 3): ArticleMeta[] {
  const all = getAllArticles();
  const current = all.find((a) => a.slug === slug);
  if (!current) return [];
  const sameCat = all.filter(
    (a) => a.slug !== slug && a.category === current.category,
  );
  const others = all.filter(
    (a) => a.slug !== slug && a.category !== current.category,
  );
  return [...sameCat, ...others].slice(0, limit);
}

export const CATEGORIES: Category[] = [
  "Reviews",
  "Entrevistas",
  "Análisis",
  "Detrás de cámaras",
];

export function categorySlug(c: Category): string {
  return c
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export function categoryFromSlug(s: string): Category | null {
  return CATEGORIES.find((c) => categorySlug(c) === s) ?? null;
}
