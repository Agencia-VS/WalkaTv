import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import {
  CATEGORIES,
  categorySlug,
  getAllArticles,
} from "../../lib/articles";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: `Artículos | ${SITE.name}`,
  description:
    "Reviews, entrevistas, análisis y detrás de cámaras del equipo de Walka TV. Contenido editorial original sobre deporte y entretenimiento.",
  alternates: { canonical: "/articulos" },
  openGraph: {
    title: `Artículos | ${SITE.name}`,
    description:
      "Reviews, entrevistas, análisis y detrás de cámaras del equipo de Walka TV.",
    url: "/articulos",
    type: "website",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ArticulosPage() {
  const articles = getAllArticles();

  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-oswald text-naranja mb-3">
              Artículos
            </h1>
            <p className="text-moonstone max-w-2xl">
              Piezas editoriales originales del equipo de Walka TV.
              Reviews, entrevistas, análisis y el detrás de cámaras de
              nuestros programas.
            </p>
          </header>

          <nav
            aria-label="Categorías"
            className="flex flex-wrap gap-2 mb-10"
          >
            <Link
              href="/articulos"
              className="px-4 py-2 border border-moonstone text-naranja font-bold text-sm hover:bg-naranja hover:text-jet transition-colors"
            >
              Todos
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/articulos/categoria/${categorySlug(c)}`}
                className="px-4 py-2 border border-moonstone text-moonstone text-sm hover:border-naranja hover:text-naranja transition-colors"
              >
                {c}
              </Link>
            ))}
          </nav>

          {articles.length === 0 ? (
            <p className="text-moonstone">
              Aún no hay artículos publicados. Vuelve muy pronto.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <li
                  key={a.slug}
                  className="border border-moonstone/50 bg-jet hover:border-naranja transition-colors flex flex-col"
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
                    <div className="p-4 flex flex-col gap-2">
                      <span className="text-xs text-naranja font-bold uppercase tracking-wider">
                        {a.category}
                      </span>
                      <h2 className="text-lg font-oswald text-naranja group-hover:underline">
                        {a.title}
                      </h2>
                      <p className="text-sm text-moonstone line-clamp-3">
                        {a.excerpt}
                      </p>
                      <div className="text-xs text-moonstone/80 mt-2 flex gap-3">
                        <time dateTime={a.date}>{formatDate(a.date)}</time>
                        <span>·</span>
                        <span>{a.readingMinutes} min de lectura</span>
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
