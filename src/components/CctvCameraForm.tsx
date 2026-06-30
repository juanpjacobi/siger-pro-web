"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CctvCameraEntry, CctvCameraInput } from "@/lib/api";

export interface CctvCameraFormCatalogs {
  tipos: string[];
  estados: string[];
  energias: string[];
  conectividades: string[];
  grabaciones: string[];
  criticidades: string[];
}

interface CctvCameraFormProps {
  catalogs: CctvCameraFormCatalogs;
  initial?: CctvCameraEntry;
  onSubmit: (input: CctvCameraInput) => Promise<void>;
  onCancel?: () => void;
}

export function CctvCameraForm({ catalogs, initial, onSubmit, onCancel }: CctvCameraFormProps) {
  // Bloque 1 — Identificación
  const [camId, setCamId] = useState(initial?.camId ?? "");
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [sector, setSector] = useState(initial?.sector ?? "");
  const [ubicacion, setUbicacion] = useState(initial?.ubicacion ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [marca, setMarca] = useState(initial?.marca ?? "");
  const [resolucion, setResolucion] = useState(initial?.resolucion ?? "");
  const [alcance, setAlcance] = useState(
    initial?.alcance !== undefined && initial?.alcance !== null ? String(initial.alcance) : "",
  );

  // Bloque 2 — Capacidades ópticas
  const [nocturna, setNocturna] = useState(initial?.nocturna ?? false);
  const [ir, setIr] = useState(initial?.ir ?? false);

  // Bloque 3 — Analíticas
  const [cruceLinea, setCruceLinea] = useState(initial?.cruceLinea ?? false);
  const [intrusion, setIntrusion] = useState(initial?.intrusion ?? false);
  const [merodeo, setMerodeo] = useState(initial?.merodeo ?? false);
  const [movimiento, setMovimiento] = useState(initial?.movimiento ?? false);
  const [facial, setFacial] = useState(initial?.facial ?? false);
  const [patente, setPatente] = useState(initial?.patente ?? false);

  // Bloque 4 — Estado e imagen
  const [estado, setEstado] = useState(initial?.estado ?? "");
  const [antivandalica, setAntivandalica] = useState(initial?.antivandalica ?? false);
  const [suciedad, setSuciedad] = useState(initial?.suciedad ?? false);
  const [desenfoque, setDesenfoque] = useState(initial?.desenfoque ?? false);
  const [obstruccion, setObstruccion] = useState(initial?.obstruccion ?? false);

  // Bloque 5 — Infraestructura y grabación
  const [energia, setEnergia] = useState(initial?.energia ?? "");
  const [conectividad, setConectividad] = useState(initial?.conectividad ?? "");
  const [grabacion, setGrabacion] = useState(initial?.grabacion ?? "");
  const [retencion, setRetencion] = useState(
    initial?.retencion !== undefined && initial?.retencion !== null ? String(initial.retencion) : "",
  );
  const [alerta, setAlerta] = useState(initial?.alerta ?? false);

  // Bloque 6 — Hallazgos y clasificación
  const [obsCCTV, setObsCCTV] = useState(initial?.obsCCTV ?? "");
  const [criticidad, setCriticidad] = useState(initial?.criticidad ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!camId.trim()) next.camId = "El ID de cámara es requerido.";
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
        camId,
        nombre: nombre || undefined,
        sector: sector || undefined,
        ubicacion: ubicacion || undefined,
        tipo: tipo || undefined,
        marca: marca || undefined,
        resolucion: resolucion || undefined,
        alcance: alcance.trim() !== "" ? Number(alcance) : undefined,
        nocturna,
        ir,
        cruceLinea,
        intrusion,
        merodeo,
        movimiento,
        facial,
        patente,
        estado: estado || undefined,
        suciedad,
        desenfoque,
        obstruccion,
        antivandalica,
        energia: energia || undefined,
        conectividad: conectividad || undefined,
        grabacion: grabacion || undefined,
        retencion: retencion.trim() !== "" ? Number(retencion) : undefined,
        alerta,
        obsCCTV: obsCCTV || undefined,
        criticidad: criticidad || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" data-testid="cctv-camera-form">
      {/* Bloque 1 — Identificación de la cámara */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="camId">ID Cámara</Label>
          <Input
            id="camId"
            value={camId}
            onChange={(e) => setCamId(e.target.value)}
            placeholder="CAM-01"
          />
          {errors.camId && <p className="text-sm text-destructive">{errors.camId}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sector">Sector</Label>
            <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input id="ubicacion" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
          </div>
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
            <Label htmlFor="marca">Marca/Modelo</Label>
            <Input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resolucion">Resolución</Label>
            <Input id="resolucion" value={resolucion} onChange={(e) => setResolucion(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alcance">Alcance estimado (m)</Label>
            <Input
              id="alcance"
              type="number"
              value={alcance}
              onChange={(e) => setAlcance(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bloque 2 — Capacidades ópticas */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="nocturna"
              aria-label="Visión nocturna"
              checked={nocturna}
              onCheckedChange={(checked) => setNocturna(!!checked)}
            />
            <Label htmlFor="nocturna">Visión nocturna</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ir"
              aria-label="IR"
              checked={ir}
              onCheckedChange={(checked) => setIr(!!checked)}
            />
            <Label htmlFor="ir">IR</Label>
          </div>
        </div>
      </div>

      {/* Bloque 3 — Analíticas */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="cruceLinea"
              aria-label="Cruce de línea"
              checked={cruceLinea}
              onCheckedChange={(checked) => setCruceLinea(!!checked)}
            />
            <Label htmlFor="cruceLinea">Cruce de línea</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="intrusion"
              aria-label="Intrusión"
              checked={intrusion}
              onCheckedChange={(checked) => setIntrusion(!!checked)}
            />
            <Label htmlFor="intrusion">Intrusión</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="merodeo"
              aria-label="Merodeo"
              checked={merodeo}
              onCheckedChange={(checked) => setMerodeo(!!checked)}
            />
            <Label htmlFor="merodeo">Merodeo</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="movimiento"
              aria-label="Movimiento"
              checked={movimiento}
              onCheckedChange={(checked) => setMovimiento(!!checked)}
            />
            <Label htmlFor="movimiento">Movimiento</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="facial"
              aria-label="Facial"
              checked={facial}
              onCheckedChange={(checked) => setFacial(!!checked)}
            />
            <Label htmlFor="facial">Facial</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="patente"
              aria-label="Patente"
              checked={patente}
              onCheckedChange={(checked) => setPatente(!!checked)}
            />
            <Label htmlFor="patente">Patente</Label>
          </div>
        </div>
      </div>

      {/* Bloque 4 — Estado e imagen */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="estado">Estado de la cámara</Label>
            <Select value={estado} onValueChange={(value) => setEstado(value ?? "")}>
              <SelectTrigger id="estado" className="w-full" aria-label="Estado de la cámara">
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

          <div className="flex items-center gap-2 self-end pb-1">
            <Checkbox
              id="antivandalica"
              aria-label="Protección antivandalica"
              checked={antivandalica}
              onCheckedChange={(checked) => setAntivandalica(!!checked)}
            />
            <Label htmlFor="antivandalica">Protección antivandalica</Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="suciedad"
              aria-label="Suciedad"
              checked={suciedad}
              onCheckedChange={(checked) => setSuciedad(!!checked)}
            />
            <Label htmlFor="suciedad">Suciedad</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="desenfoque"
              aria-label="Desenfoque"
              checked={desenfoque}
              onCheckedChange={(checked) => setDesenfoque(!!checked)}
            />
            <Label htmlFor="desenfoque">Desenfoque</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="obstruccion"
              aria-label="Obstrucción"
              checked={obstruccion}
              onCheckedChange={(checked) => setObstruccion(!!checked)}
            />
            <Label htmlFor="obstruccion">Obstrucción</Label>
          </div>
        </div>
      </div>

      {/* Bloque 5 — Infraestructura y grabación */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="energia">Energía</Label>
            <Select value={energia} onValueChange={(value) => setEnergia(value ?? "")}>
              <SelectTrigger id="energia" className="w-full" aria-label="Energía">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {catalogs.energias.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="conectividad">Conectividad</Label>
            <Select value={conectividad} onValueChange={(value) => setConectividad(value ?? "")}>
              <SelectTrigger id="conectividad" className="w-full" aria-label="Conectividad">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {catalogs.conectividades.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grabacion">Grabación</Label>
            <Select value={grabacion} onValueChange={(value) => setGrabacion(value ?? "")}>
              <SelectTrigger id="grabacion" className="w-full" aria-label="Grabación">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {catalogs.grabaciones.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="retencion">Retención (días)</Label>
            <Input
              id="retencion"
              type="number"
              value={retencion}
              onChange={(e) => setRetencion(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="alerta"
            aria-label="Alerta activa"
            checked={alerta}
            onCheckedChange={(checked) => setAlerta(!!checked)}
          />
          <Label htmlFor="alerta">Alerta activa</Label>
        </div>
      </div>

      {/* Bloque 6 — Hallazgos y clasificación */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="obsCCTV">Observaciones</Label>
          <Textarea id="obsCCTV" value={obsCCTV} onChange={(e) => setObsCCTV(e.target.value)} />
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
