"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Project, ProjectInput } from "@/lib/api";

interface ProjectFormProps {
  tipos: string[];
  initial?: Project;
  onSubmit: (input: ProjectInput) => Promise<void>;
  onCancel?: () => void;
}

function toDateInputValue(fecha: string | null | undefined): string {
  if (!fecha) return "";
  return fecha.slice(0, 10);
}

export function ProjectForm({ tipos, initial, onSubmit, onCancel }: ProjectFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [cliente, setCliente] = useState(initial?.cliente ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [ubicacion, setUbicacion] = useState(initial?.ubicacion ?? "");
  const [fecha, setFecha] = useState(toDateInputValue(initial?.fecha));
  const [profesional, setProfesional] = useState(initial?.profesional ?? "");
  const [empresa, setEmpresa] = useState(initial?.empresa ?? "");
  const [responsable, setResponsable] = useState(initial?.responsable ?? "");
  const [superficie, setSuperficie] = useState(initial?.superficie ?? "");
  const [perimetro, setPerimetro] = useState(initial?.perimetro ?? "");
  const [lotes, setLotes] = useState(initial?.lotes != null ? String(initial.lotes) : "");
  const [habitantes, setHabitantes] = useState(initial?.habitantes != null ? String(initial.habitantes) : "");
  const [accesos, setAccesos] = useState(initial?.accesos != null ? String(initial.accesos) : "");
  const [alcance, setAlcance] = useState(initial?.alcance ?? "");
  const [exclusiones, setExclusiones] = useState(initial?.exclusiones ?? "");
  const [normativa, setNormativa] = useState(initial?.normativa ?? "");
  const [criterioAceptacion, setCriterioAceptacion] = useState(initial?.criterioAceptacion ?? "");
  const [obs, setObs] = useState(initial?.obs ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre del objetivo es requerido.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        nombre,
        cliente: cliente || undefined,
        tipo: tipo || undefined,
        ubicacion: ubicacion || undefined,
        fecha: fecha || undefined,
        profesional: profesional || undefined,
        empresa: empresa || undefined,
        responsable: responsable || undefined,
        superficie: superficie !== "" ? Number(superficie) : undefined,
        perimetro: perimetro !== "" ? Number(perimetro) : undefined,
        lotes: lotes !== "" ? Number(lotes) : undefined,
        habitantes: habitantes !== "" ? Number(habitantes) : undefined,
        accesos: accesos !== "" ? Number(accesos) : undefined,
        alcance: alcance || undefined,
        exclusiones: exclusiones || undefined,
        normativa: normativa || undefined,
        criterioAceptacion: criterioAceptacion || undefined,
        obs: obs || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="project-form">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">Nombre del objetivo *</Label>
          <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cliente">Cliente</Label>
          <Input id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipo">Tipo de objetivo</Label>
          <Select value={tipo} onValueChange={(value) => setTipo(value ?? "")}>
            <SelectTrigger id="tipo" className="w-full" aria-label="Tipo de objetivo">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {tipos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ubicacion">Ubicacion</Label>
          <Input id="ubicacion" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fecha">Fecha de relevamiento</Label>
          <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profesional">Profesional actuante</Label>
          <Input id="profesional" value={profesional} onChange={(e) => setProfesional(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="empresa">Empresa de seguridad</Label>
          <Input id="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="responsable">Responsable interno</Label>
          <Input id="responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="superficie">Superficie (m2)</Label>
          <Input
            id="superficie"
            type="number"
            value={superficie}
            onChange={(e) => setSuperficie(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="perimetro">Perimetro total (m)</Label>
          <Input id="perimetro" type="number" value={perimetro} onChange={(e) => setPerimetro(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lotes">Lotes/Unidades</Label>
          <Input id="lotes" type="number" value={lotes} onChange={(e) => setLotes(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="habitantes">Habitantes aprox.</Label>
          <Input id="habitantes" type="number" value={habitantes} onChange={(e) => setHabitantes(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="accesos">Cantidad de accesos</Label>
          <Input id="accesos" type="number" value={accesos} onChange={(e) => setAccesos(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="alcance">Alcance del informe</Label>
        <Textarea id="alcance" value={alcance} onChange={(e) => setAlcance(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exclusiones">Exclusiones</Label>
        <Textarea id="exclusiones" value={exclusiones} onChange={(e) => setExclusiones(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="normativa">Normativa aplicable</Label>
        <Textarea id="normativa" value={normativa} onChange={(e) => setNormativa(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="criterioAceptacion">Criterio de aceptacion de riesgo</Label>
        <Textarea
          id="criterioAceptacion"
          value={criterioAceptacion}
          onChange={(e) => setCriterioAceptacion(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="obs">Observaciones generales</Label>
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
