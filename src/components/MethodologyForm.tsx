"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MethodologyEntry, MethodologyInput } from "@/lib/api";

interface MethodologyFormProps {
  enfoques: string[];
  initial?: MethodologyEntry;
  onSubmit: (input: MethodologyInput) => Promise<void>;
  onCancel?: () => void;
}

export function MethodologyForm({ enfoques, initial, onSubmit, onCancel }: MethodologyFormProps) {
  const [enfoque, setEnfoque] = useState(initial?.enfoque ?? "");
  const [activo, setActivo] = useState(initial?.activo ?? false);
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [aplicacion, setAplicacion] = useState(initial?.aplicacion ?? "");
  const [observaciones, setObservaciones] = useState(initial?.observaciones ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!enfoque.trim()) next.enfoque = "El enfoque es requerido.";
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
        enfoque,
        activo,
        descripcion: descripcion || undefined,
        aplicacion: aplicacion || undefined,
        observaciones: observaciones || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="methodology-form">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enfoque">Enfoque</Label>
          <Select value={enfoque} onValueChange={(value) => setEnfoque(value ?? "")}>
            <SelectTrigger id="enfoque" className="w-full" aria-label="Enfoque">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {enfoques.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.enfoque && <p className="text-sm text-destructive">{errors.enfoque}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="activo"
            aria-label="Activo"
            checked={activo}
            onCheckedChange={(checked) => setActivo(checked)}
          />
          <Label htmlFor="activo">Aplicado en este informe</Label>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descripcion">Descripcion</Label>
          <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="aplicacion">Aplicacion</Label>
          <Textarea id="aplicacion" value={aplicacion} onChange={(e) => setAplicacion(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
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
