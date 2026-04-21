interface OAuth2CallbackProps {
  searchParams: Promise<{
    code?: string;
    error?: string;
  }>;
}

export default async function OAuth2CallbackPage({
  searchParams,
}: OAuth2CallbackProps) {
  const params = await searchParams;
  const code = params.code;
  const error = params.error;

  return (
    <main className="bg-jet min-h-screen w-full pt-28 pb-20 px-4 text-naranja">
      <section className="max-w-3xl mx-auto border border-moonstone/40 p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-oswald mb-4">OAuth YouTube</h1>

        {error ? (
          <>
            <p className="text-moonstone mb-3">Se devolvió un error en la autorización:</p>
            <pre className="bg-jet border border-naranja/40 p-3 overflow-x-auto text-sm">
              {error}
            </pre>
          </>
        ) : code ? (
          <>
            <p className="text-moonstone mb-3">
              Autorización recibida correctamente. Copia este <strong>code</strong> y pégalo en la terminal.
            </p>
            <pre className="bg-jet border border-naranja/40 p-3 overflow-x-auto text-sm break-all">
              {code}
            </pre>
            <p className="text-moonstone mt-4">Comando:</p>
            <pre className="bg-jet border border-moonstone/40 p-3 overflow-x-auto text-sm break-all">
              npx tsx scripts/youtube-oauth.ts exchange "{code}"
            </pre>
            <p className="text-moonstone mt-3 text-sm">
              También puedes pegar la URL completa en el comando <strong>exchange</strong>.
            </p>
          </>
        ) : (
          <p className="text-moonstone">No llegó parámetro code ni error en la URL.</p>
        )}
      </section>
    </main>
  );
}
