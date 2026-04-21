import type { Metadata } from "next";
import Navbar from "../../components/layout/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: `Términos y condiciones | ${SITE.name}`,
  description:
    "Condiciones generales de uso del sitio web de Walka TV.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <>
      <Navbar />
      <main className="bg-jet min-h-screen w-full pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 md:px-6 text-moonstone leading-relaxed">
          <h1 className="text-4xl md:text-5xl font-oswald text-naranja mb-6">
            Términos y condiciones
          </h1>

          <h2 className="text-2xl font-oswald text-naranja mt-6 mb-3">
            1. Objeto
          </h2>
          <p className="mb-4">
            Las presentes condiciones regulan el acceso y uso del sitio
            web de {SITE.name}, cuya titularidad pertenece a{" "}
            {SITE.legalName}.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-6 mb-3">
            2. Uso del sitio
          </h2>
          <p className="mb-4">
            El usuario se compromete a hacer un uso lícito y adecuado de
            los contenidos y servicios del sitio y a no utilizarlos para
            actividades ilegales o contrarias a la buena fe.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-6 mb-3">
            3. Propiedad intelectual
          </h2>
          <p className="mb-4">
            Todos los contenidos (textos, imágenes, vídeos, logotipos y
            diseño) son propiedad de {SITE.legalName} o de terceros que
            han autorizado su uso. Queda prohibida su reproducción total o
            parcial sin autorización expresa por escrito, salvo citas con
            mención a la fuente.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-6 mb-3">
            4. Enlaces externos
          </h2>
          <p className="mb-4">
            El sitio puede incluir enlaces a páginas de terceros sobre
            cuyo contenido {SITE.legalName} no tiene control. No asumimos
            responsabilidad por la información o servicios disponibles en
            dichos sitios.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-6 mb-3">
            5. Publicidad
          </h2>
          <p className="mb-4">
            Este sitio puede mostrar anuncios servidos por Google AdSense
            y otros proveedores. Los contenidos editoriales son
            independientes de los anuncios que se muestren junto a ellos.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-6 mb-3">
            6. Exclusión de responsabilidad
          </h2>
          <p className="mb-4">
            {SITE.legalName} no garantiza la disponibilidad continuada del
            sitio ni la ausencia de errores. Nos reservamos el derecho a
            modificar, suspender o cancelar cualquier contenido o servicio
            sin previo aviso.
          </p>

          <h2 className="text-2xl font-oswald text-naranja mt-6 mb-3">
            7. Legislación aplicable
          </h2>
          <p className="mb-4">
            Estas condiciones se rigen por la legislación española.
            Cualquier controversia se someterá a los tribunales
            competentes según la ley aplicable.
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
