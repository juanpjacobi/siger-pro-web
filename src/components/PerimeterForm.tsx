"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PerimeterSectorEntry, PerimeterSectorInput } from "@/lib/api";

export interface PerimeterFormCatalogs {
  cerramientos: string[];
  estados: string[];
  escalabilidades: string[];
  continuidades: string[];
  vegetaciones: string[];
  visibilidades: string[];
  iluminaciones: string[];
  criticidades: string[];
}

interface PerimeterFormProps {
  catalogs: PerimeterFormCatalogs;
  initial?: PerimeterSectorEntry;
  onSubmit: (input: PerimeterSectorInput) => Promise<void>;
  onCancel?: () => void;
}

export function PerimeterForm({ catalogs, initial, onSubmit, onCancel }: PerimeterFormProps) {
  const [sector, setSector] = useState(initial?.sector ?? "");
  const [longitud, setLongitud] = useState(
    initial?.longitud !== undefined && initial?.longitud !== null ? String(initial.longitud) : "",
  );
  const [cerramiento, setCerramiento] = useState(initial?.cerramiento ?? "");
  const [altura, setAltura] = useState(
    initial?.altura !== undefined && initial?.altura !== null ? String(initial.altura) : "",
  );
  const [estado, setEstado] = useState(initial?.estado ?? "");
  const [escalabilidad, setEscalabilidad] = useState(initial?.escalabilidad ?? "");
  const [continuidad, setContinuidad] = useState(initial?.continuidad ?? "");
  const [vegetacion, setVegetacion] = useState(initial?.vegetacion ?? "");
  const [visibilidad, setVisibilidad] = useState(initial?.visibilidad ?? "");
  const [iluminacion, setIluminacion] = useState(initial?.iluminacion ?? "");
  const [camaras, setCamaras] = useState(initial?.camaras ?? "");
  const [sensores, setSensores] = useState(initial?.sensores ?? "");
  const [cercoElec, setCercoElec] = useState(initial?.cercoElec ?? false);
  const [concertina, setConcertina] = useState(initial?.concertina ?? false);
  const [sendero, setSendero] = useState(initial?.sendero ?? false);
  const [rondines, setRondines] = useState(initial?.rondines ?? "");
  const [vulns, setVulns] = useState(initial?.vulns ?? "");
  const [obsPer, setObsPer] = useState(initial?.obsPer ?? "");
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
        longitud: longitud.trim() !== "" ? Number(longitud) : undefined,
        cerramiento: cerramiento || undefined,
        altura: altura.trim() !== "" ? Number(altura) : undefined,
        estado: estado || undefined,
        escalabilidad: escalabilidad || undefined,
        continuidad: continuidad || undefined,
        vegetacion: vegetacion || undefined,
        visibilidad: visibilidad || undefined,
        iluminacion: iluminacion || undefined,
        camaras: camaras || undefined,
        sensores: sensores || undefined,
        cercoElec,
        concertina,
        sendero,
        rondines: rondines || undefined,
        vulns: vulns || undefined,
        obsPer: obsPer || undefined,
        criticidad: criticidad || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" data-testid="perimeter-form">
      {/* Identificacion del tramo */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sector">Sector</Label>
          <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
          {errors.sector && <p className="text-sm text-destructive">{errors.sector}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="longitud">Longitud (m)</Label>
          <Input id="longitud" type="number" value={longitud} onChange={(e) => setLongitud(e.target.value)} />
        </div>
      </div>

      {/* Cerramiento fisico */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cerramiento">Cerramiento</Label>
          <Select value={cerramiento} onValueChange={(value) => setCerramiento(value ?? "")}>
            <SelectTrigger id="cerramiento" className="w-full" aria-label="Cerramiento">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.cerramientos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="altura">Altura (m)</Label>
          <Input id="altura" type="number" value={altura} onChange={(e) => setAltura(e.target.value)} />
        </div>

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
          <Label htmlFor="escalabilidad">Escalabilidad</Label>
          <Select value={escalabilidad} onValueChange={(value) => setEscalabilidad(value ?? "")}>
            <SelectTrigger id="escalabilidad" className="w-full" aria-label="Escalabilidad">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.escalabilidades.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Condicion del entorno */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="continuidad">Continuidad</Label>
          <Select value={continuidad} onValueChange={(value) => setContinuidad(value ?? "")}>
            <SelectTrigger id="continuidad" className="w-full" aria-label="Continuidad">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.continuidades.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vegetacion">Vegetacion</Label>
          <Select value={vegetacion} onValueChange={(value) => setVegetacion(value ?? "")}>
            <SelectTrigger id="vegetacion" className="w-full" aria-label="Vegetacion">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.vegetaciones.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="visibilidad">Visibilidad</Label>
          <Select value={visibilidad} onValueChange={(value) => setVisibilidad(value ?? "")}>
            <SelectTrigger id="visibilidad" className="w-full" aria-label="Visibilidad">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.visibilidades.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="iluminacion">Iluminacion</Label>
          <Select value={iluminacion} onValueChange={(value) => setIluminacion(value ?? "")}>
            <SelectTrigger id="iluminacion" className="w-full" aria-label="Iluminacion">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.iluminaciones.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Apoyo electronico y fisico */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="camaras">Camaras</Label>
            <Textarea id="camaras" value={camaras} onChange={(e) => setCamaras(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sensores">Sensores</Label>
            <Textarea id="sensores" value={sensores} onChange={(e) => setSensores(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="cercoElec"
              aria-label="Cerco electrico"
              checked={cercoElec}
              onCheckedChange={(checked) => setCercoElec(checked)}
            />
            <Label htmlFor="cercoElec">Cerco electrico</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="concertina"
              aria-label="Concertina"
              checked={concertina}
              onCheckedChange={(checked) => setConcertina(checked)}
            />
            <Label htmlFor="concertina">Concertina</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="sendero"
              aria-label="Sendero de seguridad"
              checked={sendero}
              onCheckedChange={(checked) => setSendero(checked)}
            />
            <Label htmlFor="sendero">Sendero de seguridad</Label>
          </div>
        </div>
      </div>

      {/* Operacion y hallazgos */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rondines">Rondines asignados</Label>
          <Textarea id="rondines" value={rondines} onChange={(e) => setRondines(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vulns">Vulnerabilidades</Label>
          <Textarea id="vulns" value={vulns} onChange={(e) => setVulns(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="obsPer">Observaciones</Label>
          <Textarea id="obsPer" value={obsPer} onChange={(e) => setObsPer(e.target.value)} />
        </div>
      </div>

      {/* Clasificacion final */}
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
