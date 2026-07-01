"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IlluminationEntry, IlluminationInput } from "@/lib/api";

export interface LightingSectorFormCatalogs {
  estados: string[];
  coberturas: string[];
  criticidades: string[];
}

interface LightingSectorFormProps {
  catalogs: LightingSectorFormCatalogs;
  initial?: IlluminationEntry;
  onSubmit: (input: IlluminationInput) => Promise<void>;
  onCancel?: () => void;
}

export function LightingSectorForm({ catalogs, initial, onSubmit, onCancel }: LightingSectorFormProps) {
  // Bloque 1 — Identificacion del sector
  const [sector, setSector] = useState(initial?.sector ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [alimentacion, setAlimentacion] = useState(initial?.alimentacion ?? "");
  const [potencia, setPotencia] = useState(
    initial?.potencia !== undefined && initial?.potencia !== null ? String(initial.potencia) : "",
  );

  // Bloque 2 — Estado y cobertura
  const [estado, setEstado] = useState(initial?.estado ?? "");
  const [cobertura, setCobertura] = useState(initial?.cobertura ?? "");
  const [oscuras, setOscuras] = useState(initial?.oscuras ?? "");

  // Bloque 3 — Automatizacion
  const [fotocelula, setFotocelula] = useState(initial?.fotocelula ?? false);
  const [timer, setTimer] = useState(initial?.timer ?? false);

  // Bloque 4 — Relaciones y recomendacion
  const [cctv, setCctv] = useState(initial?.cctv ?? "");
  const [perimetro, setPerimetro] = useState(initial?.perimetro ?? "");
  const [recomendacion, setRecomendacion] = useState(initial?.recomendacion ?? "");
  const [criticidad, setCriticidad] = useState(initial?.criticidad ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!sector.trim()) next.sector = "El sector es requerido.";
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
        sector,
        tipo: tipo || undefined,
        alimentacion: alimentacion || undefined,
        potencia: potencia.trim() !== "" ? Number(potencia) : undefined,
        estado: estado || undefined,
        cobertura: cobertura || undefined,
        oscuras: oscuras || undefined,
        fotocelula,
        timer,
        cctv: cctv || undefined,
        perimetro: perimetro || undefined,
        recomendacion: recomendacion || undefined,
        criticidad: criticidad || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" data-testid="lighting-sector-form">
      {/* Bloque 1 — Identificacion del sector */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sector">Sector</Label>
          <Input
            id="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Estacionamiento Norte"
          />
          {errors.sector && <p className="text-sm text-destructive">{errors.sector}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Tipo de luminaria</Label>
            <Input id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alimentacion">Alimentacion</Label>
            <Input id="alimentacion" value={alimentacion} onChange={(e) => setAlimentacion(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="potencia">Potencia (W)</Label>
          <Input
            id="potencia"
            type="number"
            value={potencia}
            onChange={(e) => setPotencia(e.target.value)}
          />
        </div>
      </div>

      {/* Bloque 2 — Estado y cobertura */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Select value={estado} onValueChange={(value) => setEstado(value ?? "")}>
              <SelectTrigger id="estado" className="w-full" aria-label="Estado">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {catalogs.estados.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cobertura">Cobertura</Label>
            <Select value={cobertura} onValueChange={(value) => setCobertura(value ?? "")}>
              <SelectTrigger id="cobertura" className="w-full" aria-label="Cobertura">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {catalogs.coberturas.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="oscuras">Zonas oscuras</Label>
          <Textarea id="oscuras" value={oscuras} onChange={(e) => setOscuras(e.target.value)} />
        </div>
      </div>

      {/* Bloque 3 — Automatizacion */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="fotocelula"
              aria-label="Fotocélula"
              checked={fotocelula}
              onCheckedChange={(checked) => setFotocelula(!!checked)}
            />
            <Label htmlFor="fotocelula">Fotocélula</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="timer"
              aria-label="Timer"
              checked={timer}
              onCheckedChange={(checked) => setTimer(!!checked)}
            />
            <Label htmlFor="timer">Timer</Label>
          </div>
        </div>
      </div>

      {/* Bloque 4 — Relaciones y recomendacion */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cctv">Relacion con sistema de monitoreo</Label>
          <Input id="cctv" value={cctv} onChange={(e) => setCctv(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="perimetro">Relacion con perimetro</Label>
          <Input id="perimetro" value={perimetro} onChange={(e) => setPerimetro(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recomendacion">Recomendacion</Label>
          <Textarea
            id="recomendacion"
            value={recomendacion}
            onChange={(e) => setRecomendacion(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="criticidad">Criticidad</Label>
          <Select value={criticidad} onValueChange={(value) => setCriticidad(value ?? "")}>
            <SelectTrigger id="criticidad" className="w-full" aria-label="Criticidad">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.criticidades.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
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
