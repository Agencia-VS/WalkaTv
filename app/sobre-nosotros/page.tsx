import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: `Sobre nosotros | ${SITE.name}`,
  description:
    "Quiénes somos, qué hacemos y por qué en Walka TV producimos entretenimiento deportivo con estándar propio.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default function SobreNosotrosPage() {
  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 md:px-6 text-moonstone leading-relaxed">
          <h1 className="text-4xl md:text-5xl font-oswald text-naranja mb-6">
            Sobre nosotros
          </h1>
          <p className="text-lg mb-4">
            Walka TV es un medio independiente de entretenimiento y deporte
            nacido en YouTube. Producimos programas largos, entrevistas,
            reviews y análisis con un tono cercano y una producción cuidada.
          </p>
          <p className="mb-6">
            Este portal editorial complementa nuestro canal con piezas
            escritas originales: textos largos, con cabecera y autor, que
            se editan a partir de nuestras propias grabaciones.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-10 mb-3">
            Qué publicamos
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong className="text-naranja">Reviews</strong>: análisis
              honestos de productos, servicios y experiencias.
            </li>
            <li>
              <strong className="text-naranja">Entrevistas</strong>: piezas
              extensas a partir de nuestras conversaciones de cámara.
            </li>
            <li>
              <strong className="text-naranja">Análisis</strong>: opinión y
              reflexión sobre industria, clubes, jugadores y tendencias.
            </li>
            <li>
              <strong className="text-naranja">Detrás de cámaras</strong>:
              cómo hacemos lo que ves.
            </li>
          </ul>

          <h2 className="text-2xl font-oswald text-naranja mt-10 mb-3">
            Nuestro equipo
          </h2>
          <p className="mb-4">
            Somos un equipo pequeño de periodistas, realizadores y
            productores. Los artículos firmados como &quot;Equipo Walka
            TV&quot; son el resultado de un trabajo colectivo: producción,
            edición y revisión.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-10 mb-3">
            Política editorial
          </h2>
          <p className="mb-4">
            No publicamos notas de prensa sin editar, no aceptamos
            contenido pagado sin etiquetar como &quot;Contenido patrocinado&quot; y
            corregimos públicamente cualquier error en los artículos.
            Cuando una pieza incluya enlaces de afiliación se indicará de
            forma explícita.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-10 mb-3">
            Contacto
          </h2>
          <p className="mb-4">
            Puedes escribirnos a{" "}
            <a
              className="text-naranja underline"
              href={`mailto:${SITE.contactEmail}`}
            >
              {SITE.contactEmail}
            </a>{" "}
            o visitar nuestra página de{" "}
            <Link href="/contacto" className="text-naranja underline">
              contacto
            </Link>
            .
          </p>
        </article>
      </main>
      <FooterSection />
    </>
  );
}
