"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amenaza">Amenaza</Label>
        <Select value={amenaza} onValueChange={(value) => setAmenaza(value ?? "")}>
          <SelectTrigger id="amenaza" className="w-full" aria-label="Amenaza">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {catalogs.amenazas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.amenaza && <p className="text-sm text-destructive">{errors.amenaza}</p>}
      </div>

      {amenaza === "Otra" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amenazaOtra">Detalle de la amenaza</Label>
          <Input id="amenazaOtra" value={amenazaOtra} onChange={(e) => setAmenazaOtra(e.target.value)} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sector">Sector</Label>
        <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FACTORS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type="number"
              min={1}
              max={5}
              value={factors[key]}
              onChange={(e) => setFactors((prev) => ({ ...prev, [key]: e.target.value }))}
            />
            {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="medidas">Medidas propuestas</Label>
        <Textarea id="medidas" value={medidas} onChange={(e) => setMedidas(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipoMedida">Tipo de medida</Label>
          <Select value={tipoMedida} onValueChange={(value) => setTipoMedida(value ?? "")}>
            <SelectTrigger id="tipoMedida" className="w-full" aria-label="Tipo de medida">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.tiposMedida.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="responsable">Responsable</Label>
          <Input id="responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="residual">Riesgo residual</Label>
          <Select value={residual} onValueChange={(value) => setResidual(value ?? "")}>
            <SelectTrigger id="residual" className="w-full" aria-label="Riesgo residual">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.residuales.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="estadoMedida">Estado de la medida</Label>
          <Select value={estadoMedida} onValueChange={(value) => setEstadoMedida(value ?? "")}>
            <SelectTrigger id="estadoMedida" className="w-full" aria-label="Estado de la medida">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.estadosMedida.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
