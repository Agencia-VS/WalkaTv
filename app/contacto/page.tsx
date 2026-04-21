import type { Metadata } from "next";
import Navbar from "../../components/layout/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: `Contacto | ${SITE.name}`,
  description:
    "Ponte en contacto con la redacción de Walka TV: colaboraciones, prensa, sugerencias y correcciones.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <article className="max-w-2xl mx-auto px-4 md:px-6 text-moonstone leading-relaxed">
          <h1 className="text-4xl md:text-5xl font-oswald text-naranja mb-6">
            Contacto
          </h1>
          <p className="mb-6">
            ¿Quieres proponernos un invitado, colaborar con la redacción o
            reportar un error? Escríbenos y te responderemos lo antes
            posible.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            Email directo
          </h2>
          <p className="mb-6">
            <a
              className="text-naranja underline text-lg"
              href={`mailto:${SITE.contactEmail}`}
            >
              {SITE.contactEmail}
            </a>
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            Formulario rápido
          </h2>
          <form
            action={`mailto:${SITE.contactEmail}`}
            method="post"
            encType="text/plain"
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-naranja">
                Nombre
              </span>
              <input
                type="text"
                name="nombre"
                required
                className="bg-jet border border-moonstone/60 px-3 py-2 text-naranja focus:outline-none focus:border-naranja"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-naranja">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                className="bg-jet border border-moonstone/60 px-3 py-2 text-naranja focus:outline-none focus:border-naranja"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-naranja">
                Mensaje
              </span>
              <textarea
                name="mensaje"
                required
                rows={6}
                className="bg-jet border border-moonstone/60 px-3 py-2 text-naranja focus:outline-none focus:border-naranja"
              />
            </label>
            <button
              type="submit"
              className="self-start bg-naranja text-jet font-bold px-6 py-2 hover:brightness-110 transition-all"
            >
              Enviar
            </button>
          </form>

          <h2 className="text-2xl font-oswald text-naranja mt-10 mb-3">
            Redes sociales
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <a
                className="text-naranja underline"
                href={SITE.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
            </li>
            <li>
              <a
                className="text-naranja underline"
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                className="text-naranja underline"
                href={SITE.tiktok}
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
            </li>
          </ul>
        </article>
      </main>
      <FooterSection />
    </>
  );
}
