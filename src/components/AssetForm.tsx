"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AssetEntry, AssetInput } from "@/lib/api";

export interface AssetFormCatalogs {
  tipos: string[];
  valoresCualitativos: string[];
  exposiciones: string[];
  prioridades: string[];
}

interface AssetFormProps {
  catalogs: AssetFormCatalogs;
  initial?: AssetEntry;
  onSubmit: (input: AssetInput) => Promise<void>;
  onCancel?: () => void;
}

export function AssetForm({ catalogs, initial, onSubmit, onCancel }: AssetFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [ubicacion, setUbicacion] = useState(initial?.ubicacion ?? "");
  const [valorCualitativo, setValorCualitativo] = useState(initial?.valorCualitativo ?? "");
  const [valorEconomico, setValorEconomico] = useState(
    initial?.valorEconomico !== undefined && initial?.valorEconomico !== null
      ? String(initial.valorEconomico)
      : "",
  );
  const [exposicion, setExposicion] = useState(initial?.exposicion ?? "");
  const [amenazas, setAmenazas] = useState(initial?.amenazas ?? "");
  const [vulnerabilidades, setVulnerabilidades] = useState(initial?.vulnerabilidades ?? "");
  const [controles, setControles] = useState(initial?.controles ?? "");
  const [impacto, setImpacto] = useState(initial?.impacto ?? "");
  const [prioridad, setPrioridad] = useState(initial?.prioridad ?? "");
  const [obs, setObs] = useState(initial?.obs ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!nombre.trim()) next.nombre = "El nombre es requerido.";
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
        nombre,
        tipo: tipo || undefined,
        ubicacion: ubicacion || undefined,
        valorCualitativo: valorCualitativo || undefined,
        valorEconomico: valorEconomico.trim() !== "" ? Number(valorEconomico) : undefined,
        exposicion: exposicion || undefined,
        amenazas: amenazas || undefined,
        vulnerabilidades: vulnerabilidades || undefined,
        controles: controles || undefined,
        impacto: impacto || undefined,
        prioridad: prioridad || undefined,
        obs: obs || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="asset-form">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ubicacion">Ubicacion</Label>
        <Input id="ubicacion" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipo">Tipo</Label>
          <Select value={tipo} onValueChange={(value) => setTipo(value ?? "")}>
            <SelectTrigger id="tipo" className="w-full" aria-label="Tipo">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.tipos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="valorCualitativo">Valor cualitativo</Label>
          <Select value={valorCualitativo} onValueChange={(value) => setValorCualitativo(value ?? "")}>
            <SelectTrigger id="valorCualitativo" className="w-full" aria-label="Valor cualitativo">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.valoresCualitativos.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exposicion">Exposicion</Label>
          <Select value={exposicion} onValueChange={(value) => setExposicion(value ?? "")}>
            <SelectTrigger id="exposicion" className="w-full" aria-label="Exposicion">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.exposiciones.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prioridad">Prioridad</Label>
          <Select value={prioridad} onValueChange={(value) => setPrioridad(value ?? "")}>
            <SelectTrigger id="prioridad" className="w-full" aria-label="Prioridad">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.prioridades.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="valorEconomico">Valor economico</Label>
          <Input
            id="valorEconomico"
            type="number"
            value={valorEconomico}
            onChange={(e) => setValorEconomico(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amenazas">Amenazas</Label>
        <Textarea id="amenazas" value={amenazas} onChange={(e) => setAmenazas(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vulnerabilidades">Vulnerabilidades</Label>
        <Textarea
          id="vulnerabilidades"
          value={vulnerabilidades}
          onChange={(e) => setVulnerabilidades(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="controles">Controles</Label>
        <Textarea id="controles" value={controles} onChange={(e) => setControles(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="impacto">Impacto</Label>
        <Textarea id="impacto" value={impacto} onChange={(e) => setImpacto(e.target.value)} />
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
