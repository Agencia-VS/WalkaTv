"use client";

import { useState } from "react";
import { SITE } from "../../lib/site";

type Status = "idle" | "sending" | "sent" | "error";

const TOPICS = [
  "Propuesta de invitado",
  "Colaboración con la redacción",
  "Prensa y medios",
  "Reportar un error",
  "Otro",
] as const;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("sending");

    const form = event.currentTarget;
    const data = new FormData(form);

    const nombre = String(data.get("nombre") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topic = String(data.get("topic") ?? "").trim();
    const mensaje = String(data.get("mensaje") ?? "").trim();
    const honeypot = String(data.get("website") ?? "").trim();

    if (honeypot) {
      setStatus("sent");
      return;
    }

    if (!nombre || !email || !mensaje) {
      setStatus("error");
      setError("Completa nombre, email y mensaje.");
      return;
    }

    const subject = topic
      ? `[Walka TV] ${topic} · ${nombre}`
      : `[Walka TV] Contacto · ${nombre}`;

    const body = [
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      topic ? `Tema: ${topic}` : null,
      "",
      mensaje,
    ]
      .filter(Boolean)
      .join("\n");

    const href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    try {
      window.location.href = href;
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError("No se pudo abrir tu cliente de correo. Escríbenos al email directo.");
    }
  }

  const inputBase =
    "w-full bg-jet border border-moonstone/40 px-4 py-3 text-moonstone placeholder:text-moonstone/40 focus:outline-none focus:border-naranja focus:ring-1 focus:ring-naranja transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 border border-moonstone/40 bg-jet p-6 md:p-8 hover:border-naranja/60 transition-colors"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold text-naranja uppercase tracking-wider">
            Nombre
          </span>
          <input
            type="text"
            name="nombre"
            required
            autoComplete="name"
            placeholder="Tu nombre"
            className={inputBase}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold text-naranja uppercase tracking-wider">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className={inputBase}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-bold text-naranja uppercase tracking-wider">
          Tema
        </span>
        <select name="topic" defaultValue="" className={inputBase}>
          <option value="" disabled>
            Selecciona un tema
          </option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-bold text-naranja uppercase tracking-wider">
          Mensaje
        </span>
        <textarea
          name="mensaje"
          required
          rows={6}
          placeholder="Cuéntanos en qué podemos ayudarte."
          className={`${inputBase} resize-y min-h-[140px]`}
        />
      </label>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
        <p className="text-xs text-moonstone/70 leading-relaxed">
          Al enviar, se abrirá tu cliente de correo con el mensaje listo.
          Tu información no se almacena en este sitio.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="self-start md:self-auto bg-naranja text-jet font-bold px-6 py-3 uppercase tracking-wider text-sm hover:brightness-110 disabled:opacity-60 transition-all"
        >
          {status === "sending" ? "Enviando..." : "Enviar mensaje"}
        </button>
      </div>

      {status === "sent" && (
        <p className="text-sm text-naranja border-t border-moonstone/30 pt-4">
          Abrimos tu cliente de correo. Si no se abrió, escríbenos directo a{" "}
          <a
            className="underline"
            href={`mailto:${SITE.contactEmail}`}
          >
            {SITE.contactEmail}
          </a>
          .
        </p>
      )}

      {status === "error" && error && (
        <p className="text-sm text-red-400 border-t border-red-400/30 pt-4">
          {error}
        </p>
      )}
    </form>
  );
}
