import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: `Política de cookies | ${SITE.name}`,
  description:
    "Información detallada sobre las cookies que utiliza el sitio web de Walka TV.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 md:px-6 text-moonstone leading-relaxed">
          <h1 className="text-4xl md:text-5xl font-oswald text-naranja mb-6">
            Política de cookies
          </h1>
          <p className="mb-4">
            Este sitio utiliza cookies propias y de terceros para
            garantizar su correcto funcionamiento, analizar el tráfico y
            mostrar publicidad.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            Qué es una cookie
          </h2>
          <p className="mb-4">
            Una cookie es un pequeño fichero de datos que se descarga en
            tu dispositivo al visitar un sitio web. Permite recordar
            información sobre tu visita para mejorar tu experiencia.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            Cookies que usamos
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong className="text-naranja">Técnicas</strong>: necesarias
              para el funcionamiento del sitio.
            </li>
            <li>
              <strong className="text-naranja">Analíticas</strong>: miden el
              uso del sitio de forma agregada.
            </li>
            <li>
              <strong className="text-naranja">Publicidad (Google AdSense)</strong>:
              Google y sus socios utilizan cookies para mostrar anuncios
              basados en visitas previas a éste u otros sitios. Puedes
              inhabilitarlas desde{" "}
              <a
                className="text-naranja underline"
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Configuración de anuncios de Google
              </a>
              .
            </li>
          </ul>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            Cómo gestionar las cookies
          </h2>
          <p className="mb-4">
            Puedes aceptar, rechazar o borrar cookies desde la
            configuración de tu navegador. Desactivarlas puede afectar al
            funcionamiento de algunas partes del sitio.
          </p>
          <p className="mb-4">
            Para más información consulta nuestra{" "}
            <Link href="/privacidad" className="text-naranja underline">
              política de privacidad
            </Link>
            .
          </p>
          <p className="text-xs text-moonstone/70 mt-8">
            Última actualización: {new Date().toLocaleDateString("es-ES")}.
          </p>
        </article>
      </main>
      <FooterSection />
    </>
  );
}
