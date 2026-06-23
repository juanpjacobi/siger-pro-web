"use client";

import { FormEvent, useState } from "react";
import { AdversaryTimeEntry, AdversaryTimeInput } from "@/lib/api";

export interface AdversaryTimeFormCatalogs {
  amenazas: string[];
}

interface AdversaryTimeFormProps {
  catalogs: AdversaryTimeFormCatalogs;
  initial?: AdversaryTimeEntry;
  onSubmit: (input: AdversaryTimeInput) => Promise<void>;
  onCancel?: () => void;
}

const TIMES = [
  { key: "ti", label: "ti - Tiempo de intrusion" },
  { key: "te", label: "te - Tiempo de ejecucion" },
  { key: "td", label: "td - Tiempo de deteccion" },
  { key: "tr", label: "tr - Tiempo de respuesta" },
] as const;

function emptyTimes(initial?: AdversaryTimeEntry): Record<(typeof TIMES)[number]["key"], string> {
  return {
    ti: initial ? String(initial.ti) : "",
    te: initial ? String(initial.te) : "",
    td: initial ? String(initial.td) : "",
    tr: initial ? String(initial.tr) : "",
  };
}

export function AdversaryTimeForm({ catalogs, initial, onSubmit, onCancel }: AdversaryTimeFormProps) {
  const [amenaza, setAmenaza] = useState(initial?.amenaza ?? "");
  const [times, setTimes] = useState(emptyTimes(initial));
  const [obs, setObs] = useState(initial?.obs ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!amenaza.trim()) next.amenaza = "La amenaza es requerida.";
    for (const { key, label } of TIMES) {
      const raw = times[key];
      const value = Number(raw);
      if (raw.trim() === "" || Number.isNaN(value) || value < 0) {
        next[key] = `${label} debe ser un numero mayor o igual a 0.`;
      }
    }
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        amenaza,
        ti: Number(times.ti),
        te: Number(times.te),
        td: Number(times.td),
        tr: Number(times.tr),
        obs: obs || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="adversary-time-form">
      <div>
        <label htmlFor="at-amenaza" className="block text-sm font-medium">
          Amenaza
        </label>
        <select
          id="at-amenaza"
          value={amenaza}
          onChange={(e) => setAmenaza(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        >
          <option value="">Seleccionar...</option>
          {catalogs.amenazas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {errors.amenaza && <p className="mt-1 text-sm text-red-600">{errors.amenaza}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TIMES.map(({ key, label }) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium">
              {label}
            </label>
            <input
              id={key}
              type="number"
              min={0}
              value={times[key]}
              onChange={(e) => setTimes((prev) => ({ ...prev, [key]: e.target.value }))}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />
            {errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="obs" className="block text-sm font-medium">
          Observaciones
        </label>
        <textarea
          id="obs"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded border border-gray-300 px-4 py-2 sm:w-auto"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50 sm:w-auto"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
