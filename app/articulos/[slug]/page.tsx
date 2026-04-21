import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Navbar from "../../../components/layout/Navbar";
import FooterSection from "../../../components/sections/FooterSection";
import {
  getAllArticles,
  getArticleBySlug,
  getRelated,
  categorySlug,
} from "../../../lib/articles";
import { SITE } from "../../../lib/site";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Artículo no encontrado" };
  return {
    title: `${article.title} | ${SITE.name}`,
    description: article.excerpt,
    alternates: { canonical: `/articulos/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `/articulos/${article.slug}`,
      publishedTime: article.date,
      authors: [article.author],
      images: article.cover ? [{ url: article.cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.cover ? [article.cover] : undefined,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl md:text-3xl font-oswald text-naranja mt-10 mb-4"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl md:text-2xl font-oswald text-naranja mt-8 mb-3"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-moonstone leading-relaxed mb-4 text-base md:text-lg"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc pl-6 text-moonstone space-y-2 mb-4 text-base md:text-lg"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal pl-6 text-moonstone space-y-2 mb-4 text-base md:text-lg"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-naranja underline hover:no-underline"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-naranja font-bold" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-naranja pl-4 italic text-moonstone my-6"
      {...props}
    />
  ),
};

export default async function ArticuloPage({ params }: Params) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelated(article.slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.cover ? `${SITE.url}${article.cover}` : undefined,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: `${SITE.url}/articulos/${article.slug}`,
  };

  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 md:px-6">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-moonstone mb-6"
          >
            <Link href="/" className="hover:text-naranja">
              Inicio
            </Link>
            {" / "}
            <Link href="/articulos" className="hover:text-naranja">
              Artículos
            </Link>
            {" / "}
            <Link
              href={`/articulos/categoria/${categorySlug(
                article.category,
              )}`}
              className="hover:text-naranja"
            >
              {article.category}
            </Link>
          </nav>

          <header className="mb-8">
            <span className="text-xs text-naranja font-bold uppercase tracking-wider">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-oswald text-naranja mt-2 mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-lg text-moonstone mb-4">{article.excerpt}</p>
            <div className="flex flex-wrap gap-3 text-xs text-moonstone/80">
              <span>{article.author}</span>
              <span>·</span>
              <time dateTime={article.date}>
                {formatDate(article.date)}
              </time>
              <span>·</span>
              <span>{article.readingMinutes} min de lectura</span>
            </div>
          </header>

          {article.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.cover}
              alt={article.title}
              className="w-full aspect-video object-cover mb-10 border border-moonstone/40"
            />
          )}

          <div className="prose-walka">
            <MDXRemote
              source={article.content}
              components={mdxComponents}
            />
          </div>

          {article.videoId && (
            <section className="mt-12">
              <h2 className="text-2xl font-oswald text-naranja mb-4">
                Vídeo original
              </h2>
              <div className="aspect-video w-full border border-moonstone/40">
                <iframe
                  src={`https://www.youtube.com/embed/${article.videoId}`}
                  title={article.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </section>
          )}

          <footer className="mt-12 pt-8 border-t border-moonstone/30">
            <p className="text-sm text-moonstone">
              Publicado por <strong className="text-naranja">{article.author}</strong>.
              {" "}Si quieres contactar con la redacción, escríbenos a{" "}
              <a
                className="text-naranja underline"
                href={`mailto:${SITE.contactEmail}`}
              >
                {SITE.contactEmail}
              </a>
              .
            </p>
          </footer>

          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-oswald text-naranja mb-6">
                Sigue leyendo
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <li
                    key={r.slug}
                    className="border border-moonstone/40 hover:border-naranja transition-colors"
                  >
                    <Link
                      href={`/articulos/${r.slug}`}
                      className="block p-4"
                    >
                      <span className="text-xs text-naranja font-bold uppercase tracking-wider">
                        {r.category}
                      </span>
                      <h3 className="text-base font-oswald text-naranja mt-1 mb-1 hover:underline">
                        {r.title}
                      </h3>
                      <p className="text-xs text-moonstone line-clamp-2">
                        {r.excerpt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <FooterSection />
    </>
  );
}
