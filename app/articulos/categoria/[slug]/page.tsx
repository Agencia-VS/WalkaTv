import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/sections/FooterSection";
import {
  CATEGORIES,
  categoryFromSlug,
  categorySlug,
  getArticlesByCategory,
} from "@/lib/articles";
import { SITE } from "@/lib/site";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: categorySlug(c) }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: "Categoría no encontrada" };
  return {
    title: `${category} | Artículos | ${SITE.name}`,
    description: `Artículos de la categoría ${category} en ${SITE.name}.`,
    alternates: { canonical: `/articulos/categoria/${slug}` },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function CategoriaPage({ params }: Params) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();
  const articles = getArticlesByCategory(category);

  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <nav className="text-xs text-moonstone mb-4">
            <Link href="/articulos" className="hover:text-naranja">
              Artículos
            </Link>
            {" / "}
            <span>{category}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-oswald text-naranja mb-10">
            {category}
          </h1>

          {articles.length === 0 ? (
            <p className="text-moonstone">
              Todavía no hay artículos publicados en esta categoría.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <li
                  key={a.slug}
                  className="border border-moonstone/50 bg-jet hover:border-naranja transition-colors"
                >
                  <Link
                    href={`/articulos/${a.slug}`}
                    className="block group"
                  >
                    {a.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.cover}
                        alt={a.title}
                        className="w-full aspect-video object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h2 className="text-lg font-oswald text-naranja group-hover:underline">
                        {a.title}
                      </h2>
                      <p className="text-sm text-moonstone line-clamp-3 mt-2">
                        {a.excerpt}
                      </p>
                      <div className="text-xs text-moonstone/80 mt-3 flex gap-2">
                        <time dateTime={a.date}>
                          {formatDate(a.date)}
                        </time>
                        <span>·</span>
                        <span>{a.readingMinutes} min</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <FooterSection />
    </>
  );
}
