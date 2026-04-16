"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "commercial@unipars.com.co";

type FormState = {
  nombre: string;
  celular: string;
  email: string;
  mensaje: string;
};

const initialState: FormState = {
  nombre: "",
  celular: "",
  email: "",
  mensaje: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = [
      `Nombre: ${form.nombre}`,
      `Celular: ${form.celular}`,
      `Email: ${form.email}`,
      "",
      "Mensaje:",
      form.mensaje,
    ].join("\n");

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Solicitud de contacto desde unipars.com.co",
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setFeedback("Abrimos tu correo para completar el envio del mensaje.");
    setForm(initialState);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-black/8 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-7"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ed8435]">
          Aqui estamos
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#16384f] sm:text-3xl">
          Estamos para atender tu necesidad
        </h2>
        <p className="mt-3 max-w-[42rem] text-sm leading-6 text-[#5f6d78]">
          Completa el formulario y uno de nuestros asesores se pondra en contacto contigo en la mayor brevedad.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-[#16384f]">
          Nombre
          <input
            required
            type="text"
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
            className="h-12 rounded-lg border border-black/10 bg-white px-4 text-sm text-[#16384f] outline-none transition-colors duration-200 focus:border-[#ed8435]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[#16384f]">
          Celular
          <input
            required
            type="tel"
            value={form.celular}
            onChange={(event) =>
              setForm((current) => ({ ...current, celular: event.target.value }))
            }
            className="h-12 rounded-lg border border-black/10 bg-white px-4 text-sm text-[#16384f] outline-none transition-colors duration-200 focus:border-[#ed8435]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[#16384f]">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className="h-12 rounded-lg border border-black/10 bg-white px-4 text-sm text-[#16384f] outline-none transition-colors duration-200 focus:border-[#ed8435]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[#16384f]">
          Mensaje
          <textarea
            required
            rows={5}
            value={form.mensaje}
            onChange={(event) =>
              setForm((current) => ({ ...current, mensaje: event.target.value }))
            }
            className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-[#16384f] outline-none transition-colors duration-200 focus:border-[#ed8435]"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#ed8435] px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
        >
          Enviar
        </button>
        <p className="text-xs leading-5 text-[#74818c]">
          Tambien puedes escribirnos a {CONTACT_EMAIL}.
        </p>
      </div>

      {feedback ? (
        <p className="mt-4 rounded-lg border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm text-[#a35b1f]">
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
