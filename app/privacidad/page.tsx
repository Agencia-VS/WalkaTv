import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: `Política de privacidad | ${SITE.name}`,
  description:
    "Cómo trata Walka TV tus datos personales, qué cookies usamos y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 md:px-6 text-moonstone leading-relaxed">
          <h1 className="text-4xl md:text-5xl font-oswald text-naranja mb-6">
            Política de privacidad
          </h1>
          <p className="mb-4">
            En {SITE.name} respetamos tu privacidad. Esta política explica
            qué datos recopilamos, con qué fines y qué derechos tienes
            sobre ellos.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            1. Responsable del tratamiento
          </h2>
          <p className="mb-4">
            El responsable del tratamiento de tus datos es {SITE.legalName}.
            Puedes contactar con nosotros en{" "}
            <a
              className="text-naranja underline"
              href={`mailto:${SITE.contactEmail}`}
            >
              {SITE.contactEmail}
            </a>
            .
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            2. Datos que recopilamos
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong className="text-naranja">Formulario de contacto:</strong>{" "}
              si nos escribes, tratamos tu nombre, email y el contenido del
              mensaje con el fin único de responderte.
            </li>
            <li>
              <strong className="text-naranja">Datos de navegación:</strong>{" "}
              cookies y tecnologías similares para analítica y publicidad
              (ver apartado 4).
            </li>
          </ul>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            3. Base legal y finalidades
          </h2>
          <p className="mb-4">
            Tratamos tus datos con las siguientes bases legales: tu
            consentimiento expreso al aceptar cookies, el interés legítimo
            para el funcionamiento básico del sitio y la ejecución de
            comunicaciones que tú nos solicitas.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            4. Cookies y publicidad de terceros
          </h2>
          <p className="mb-4">
            Este sitio utiliza <strong className="text-naranja">Google AdSense</strong>{" "}
            y otros servicios de Google. Google y sus socios pueden usar
            cookies para publicar anuncios basados en tus visitas
            anteriores a este sitio u otros sitios web. Puedes inhabilitar
            la publicidad personalizada visitando{" "}
            <a
              className="text-naranja underline"
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Configuración de anuncios de Google
            </a>
            .
          </p>
          <p className="mb-4">
            Más información en nuestra{" "}
            <Link href="/cookies" className="text-naranja underline">
              política de cookies
            </Link>
            .
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            5. Conservación de datos
          </h2>
          <p className="mb-4">
            Conservamos los datos el tiempo estrictamente necesario para
            atender tu solicitud y cumplir con las obligaciones legales
            aplicables.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            6. Derechos
          </h2>
          <p className="mb-4">
            Puedes ejercer tus derechos de acceso, rectificación,
            supresión, oposición, limitación y portabilidad enviando un
            email a{" "}
            <a
              className="text-naranja underline"
              href={`mailto:${SITE.contactEmail}`}
            >
              {SITE.contactEmail}
            </a>{" "}
            indicando tu solicitud. Si consideras que no hemos atendido
            correctamente tus derechos, puedes presentar una reclamación
            ante la autoridad de protección de datos competente.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-8 mb-3">
            7. Cambios en esta política
          </h2>
          <p className="mb-4">
            Podemos actualizar esta política cuando sea necesario. La
            versión vigente es siempre la publicada en esta página con su
            fecha de actualización.
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
