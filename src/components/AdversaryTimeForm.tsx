"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="at-amenaza">Amenaza</Label>
        <Select value={amenaza} onValueChange={(value) => setAmenaza(value ?? "")}>
          <SelectTrigger id="at-amenaza" className="w-full" aria-label="Amenaza">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TIMES.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type="number"
              min={0}
              value={times[key]}
              onChange={(e) => setTimes((prev) => ({ ...prev, [key]: e.target.value }))}
            />
            {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="obs">Observaciones</Label>
        <Textarea id="obs" value={obs} onChange={(e) => setObs(e.target.value)} />
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
