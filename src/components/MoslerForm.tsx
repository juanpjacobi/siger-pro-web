"use client";

import { FormEvent, useState } from "react";
import { MoslerEntry, MoslerInput } from "@/lib/api";

export interface MoslerFormCatalogs {
  amenazas: string[];
  tiposMedida: string[];
  residuales: string[];
  estadosMedida: string[];
}

interface MoslerFormProps {
  catalogs: MoslerFormCatalogs;
  initial?: MoslerEntry;
  onSubmit: (input: MoslerInput) => Promise<void>;
  onCancel?: () => void;
}

const FACTORS = [
  { key: "F", label: "F - Funcion" },
  { key: "S", label: "S - Sustitucion" },
  { key: "P", label: "P - Profundidad" },
  { key: "E", label: "E - Extension" },
  { key: "A", label: "A - Agresion" },
  { key: "V", label: "V - Vulnerabilidad" },
] as const;

function emptyFactors(initial?: MoslerEntry): Record<(typeof FACTORS)[number]["key"], string> {
  return {
    F: initial ? String(initial.f) : "",
    S: initial ? String(initial.s) : "",
    P: initial ? String(initial.p) : "",
    E: initial ? String(initial.e) : "",
    A: initial ? String(initial.a) : "",
    V: initial ? String(initial.v) : "",
  };
}

export function MoslerForm({ catalogs, initial, onSubmit, onCancel }: MoslerFormProps) {
  const [amenaza, setAmenaza] = useState(initial?.amenaza ?? "");
  const [amenazaOtra, setAmenazaOtra] = useState(initial?.amenazaOtra ?? "");
  const [factors, setFactors] = useState(emptyFactors(initial));
  const [sector, setSector] = useState(initial?.sector ?? "");
  const [medidas, setMedidas] = useState(initial?.medidas ?? "");
  const [tipoMedida, setTipoMedida] = useState(initial?.tipoMedida ?? "");
  const [responsable, setResponsable] = useState(initial?.responsable ?? "");
  const [residual, setResidual] = useState(initial?.residual ?? "");
  const [estadoMedida, setEstadoMedida] = useState(initial?.estadoMedida ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!amenaza.trim()) next.amenaza = "La amenaza es requerida.";
    for (const { key, label } of FACTORS) {
      const raw = factors[key];
      const value = Number(raw);
      if (raw.trim() === "" || Number.isNaN(value) || value < 1 || value > 5) {
        next[key] = `${label} debe ser un numero entre 1 y 5.`;
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
        amenazaOtra: amenazaOtra || undefined,
        sector: sector || undefined,
        F: Number(factors.F),
        S: Number(factors.S),
        P: Number(factors.P),
        E: Number(factors.E),
        A: Number(factors.A),
        V: Number(factors.V),
        medidas: medidas || undefined,
        tipoMedida: tipoMedida || undefined,
        responsable: responsable || undefined,
        residual: residual || undefined,
        estadoMedida: estadoMedida || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="mosler-form">
      <div>
        <label htmlFor="amenaza" className="block text-sm font-medium">
          Amenaza
        </label>
        <select
          id="amenaza"
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

      {amenaza === "Otra" && (
        <div>
          <label htmlFor="amenazaOtra" className="block text-sm font-medium">
            Detalle de la amenaza
          </label>
          <input
            id="amenazaOtra"
            value={amenazaOtra}
            onChange={(e) => setAmenazaOtra(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
      )}

      <div>
        <label htmlFor="sector" className="block text-sm font-medium">
          Sector
        </label>
        <input
          id="sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FACTORS.map(({ key, label }) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium">
              {label}
            </label>
            <input
              id={key}
              type="number"
              min={1}
              max={5}
              value={factors[key]}
              onChange={(e) => setFactors((prev) => ({ ...prev, [key]: e.target.value }))}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />
            {errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="medidas" className="block text-sm font-medium">
          Medidas propuestas
        </label>
        <textarea
          id="medidas"
          value={medidas}
          onChange={(e) => setMedidas(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="tipoMedida" className="block text-sm font-medium">
            Tipo de medida
          </label>
          <select
            id="tipoMedida"
            value={tipoMedida}
            onChange={(e) => setTipoMedida(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            <option value="">Seleccionar...</option>
            {catalogs.tiposMedida.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="responsable" className="block text-sm font-medium">
            Responsable
          </label>
          <input
            id="responsable"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="residual" className="block text-sm font-medium">
            Riesgo residual
          </label>
          <select
            id="residual"
            value={residual}
            onChange={(e) => setResidual(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            <option value="">Seleccionar...</option>
            {catalogs.residuales.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estadoMedida" className="block text-sm font-medium">
            Estado de la medida
          </label>
          <select
            id="estadoMedida"
            value={estadoMedida}
            onChange={(e) => setEstadoMedida(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            <option value="">Seleccionar...</option>
            {catalogs.estadosMedida.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
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
