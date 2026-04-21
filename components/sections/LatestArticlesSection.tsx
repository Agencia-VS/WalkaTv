import Link from "next/link";
import { getAllArticles } from "../../lib/articles";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function LatestArticlesSection() {
  const articles = getAllArticles().slice(0, 6);

  return (
    <section
      id="articulos"
      className="bg-jet w-full flex flex-col items-center px-4 py-20 text-white scroll-mt-24"
      data-section="articulos"
    >
      <div className="max-w-6xl w-full mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-naranja font-oswald">
              Artículos recientes
            </h2>
            <p className="text-moonstone mt-2 max-w-2xl">
              Reviews, entrevistas, análisis y detrás de cámaras escritos
              por el equipo de Walka TV.
            </p>
          </div>
          <Link
            href="/articulos"
            className="self-start md:self-auto border border-naranja text-naranja px-5 py-2 font-bold text-sm hover:bg-naranja hover:text-jet transition-colors"
          >
            Ver todos
          </Link>
        </header>

        {articles.length === 0 ? (
          <p className="text-moonstone">Muy pronto nuevos artículos.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <span className="text-xs text-naranja font-bold uppercase tracking-wider">
                      {a.category}
                    </span>
                    <h3 className="text-lg font-oswald text-naranja mt-1 group-hover:underline">
                      {a.title}
                    </h3>
                    <p className="text-sm text-moonstone line-clamp-3 mt-2">
                      {a.excerpt}
                    </p>
                    <div className="text-xs text-moonstone/80 mt-3 flex gap-2">
                      <time dateTime={a.date}>{formatDate(a.date)}</time>
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
    </section>
  );
}
