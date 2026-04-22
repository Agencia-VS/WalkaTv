import type { Metadata } from "next";
import Navbar from "../../components/layout/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import ContactForm from "../../components/sections/ContactForm";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: `Contacto | ${SITE.name}`,
  description:
    "Ponte en contacto con la redacción de Walka TV: colaboraciones, prensa, sugerencias y correcciones.",
  alternates: { canonical: "/contacto" },
};

const SOCIAL_LINKS = [
  { label: "YouTube", href: SITE.youtube },
  { label: "Instagram", href: SITE.instagram },
  { label: "TikTok", href: SITE.tiktok },
];

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20 text-moonstone">
        <section className="max-w-6xl mx-auto px-4 md:px-6">
          <header className="mb-10 md:mb-14 max-w-3xl">
            <span className="text-xs font-bold text-naranja uppercase tracking-wider">
              Contacto
            </span>
            <h1 className="text-3xl md:text-5xl font-oswald text-naranja mt-3 mb-4 leading-tight">
              Hablemos de fútbol, ideas y colaboraciones
            </h1>
            <p className="text-moonstone/90 leading-relaxed">
              ¿Quieres proponernos un invitado, colaborar con la redacción
              o reportar un error? Escríbenos y te respondemos lo antes
              posible.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
            <div>
              <h2 className="text-xl md:text-2xl font-oswald text-naranja mb-4">
                Envíanos un mensaje
              </h2>
              <ContactForm />
            </div>

            <aside className="flex flex-col gap-6">
              <div className="border border-moonstone/40 bg-jet p-6 hover:border-naranja/60 transition-colors">
                <h2 className="text-lg md:text-xl font-oswald text-naranja mb-3">
                  Email directo
                </h2>
                <p className="text-sm text-moonstone/80 mb-3">
                  Para prensa, colaboraciones o propuestas editoriales.
                </p>
                <a
                  className="text-naranja underline break-all"
                  href={`mailto:${SITE.contactEmail}`}
                >
                  {SITE.contactEmail}
                </a>
              </div>

              <div className="border border-moonstone/40 bg-jet p-6 hover:border-naranja/60 transition-colors">
                <h2 className="text-lg md:text-xl font-oswald text-naranja mb-3">
                  Redes sociales
                </h2>
                <ul className="flex flex-col gap-2">
                  {SOCIAL_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        className="text-moonstone hover:text-naranja transition-colors inline-flex items-center gap-2"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-block w-1.5 h-1.5 bg-naranja"
                        />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-moonstone/40 bg-jet p-6">
                <h2 className="text-lg md:text-xl font-oswald text-naranja mb-3">
                  Tiempo de respuesta
                </h2>
                <p className="text-sm text-moonstone/80 leading-relaxed">
                  Revisamos mensajes de lunes a viernes. Normalmente
                  respondemos en un plazo de 2 a 5 días hábiles.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}
