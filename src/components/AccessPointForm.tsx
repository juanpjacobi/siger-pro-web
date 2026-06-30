"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AccessPointEntry, AccessPointInput } from "@/lib/api";

export interface AccessPointFormCatalogs {
  tipos: string[];
  ctrlPeatonales: string[];
  ctrlVehiculares: string[];
  congestiones: string[];
  trazabilidades: string[];
}

interface AccessPointFormProps {
  catalogs: AccessPointFormCatalogs;
  initial?: AccessPointEntry;
  onSubmit: (input: AccessPointInput) => Promise<void>;
  onCancel?: () => void;
}

export function AccessPointForm({ catalogs, initial, onSubmit, onCancel }: AccessPointFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [carriles, setCarriles] = useState(
    initial?.carriles !== undefined && initial?.carriles !== null ? String(initial.carriles) : "",
  );
  const [uso, setUso] = useState(initial?.uso ?? "");

  const [ctrlPeatonal, setCtrlPeatonal] = useState(initial?.ctrlPeatonal ?? "");
  const [ctrlVehicular, setCtrlVehicular] = useState(initial?.ctrlVehicular ?? "");
  const [barreras, setBarreras] = useState(initial?.barreras ?? false);
  const [portones, setPortones] = useState(initial?.portones ?? false);
  const [molinetes, setMolinetes] = useState(initial?.molinetes ?? false);
  const [biometria, setBiometria] = useState(initial?.biometria ?? false);
  const [rfid, setRfid] = useState(initial?.rfid ?? false);
  const [qr, setQr] = useState(initial?.qr ?? false);
  const [app, setApp] = useState(initial?.app ?? false);
  const [validManual, setValidManual] = useState(initial?.validManual ?? false);

  const [protoVisitas, setProtoVisitas] = useState(initial?.protoVisitas ?? "");
  const [protoProv, setProtoProv] = useState(initial?.protoProv ?? "");
  const [registroNube, setRegistroNube] = useState(initial?.registroNube ?? false);

  const [camaras, setCamaras] = useState(initial?.camaras ?? "");
  const [lpr, setLpr] = useState(initial?.lpr ?? false);
  const [ups, setUps] = useState(initial?.ups ?? false);
  const [generador, setGenerador] = useState(initial?.generador ?? false);
  const [congestion, setCongestion] = useState(initial?.congestion ?? "");
  const [trazabilidad, setTrazabilidad] = useState(initial?.trazabilidad ?? "");

  const [vulns, setVulns] = useState(initial?.vulns ?? "");
  const [riesgo, setRiesgo] = useState(initial?.riesgo ?? "");

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
        carriles: carriles.trim() !== "" ? Number(carriles) : undefined,
        uso: uso || undefined,
        barreras,
        portones,
        molinetes,
        biometria,
        rfid,
        qr,
        app,
        validManual,
        registroNube,
        protoVisitas: protoVisitas || undefined,
        protoProv: protoProv || undefined,
        ctrlPeatonal: ctrlPeatonal || undefined,
        ctrlVehicular: ctrlVehicular || undefined,
        camaras: camaras || undefined,
        lpr,
        ups,
        generador,
        congestion: congestion || undefined,
        trazabilidad: trazabilidad || undefined,
        vulns: vulns || undefined,
        riesgo: riesgo || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" data-testid="access-point-form">
      {/* Bloque 1: Identificacion del acceso */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">Nombre del acceso</Label>
          <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
        </div>

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
          <Label htmlFor="carriles">Carriles/darsenas</Label>
          <Input
            id="carriles"
            type="number"
            value={carriles}
            onChange={(e) => setCarriles(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="uso">Uso</Label>
          <Input id="uso" value={uso} onChange={(e) => setUso(e.target.value)} />
        </div>
      </div>

      {/* Bloque 2: Control de acceso */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ctrlPeatonal">Control peatonal</Label>
            <Select value={ctrlPeatonal} onValueChange={(value) => setCtrlPeatonal(value ?? "")}>
              <SelectTrigger id="ctrlPeatonal" className="w-full" aria-label="Control peatonal">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {catalogs.ctrlPeatonales.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ctrlVehicular">Control vehicular</Label>
            <Select value={ctrlVehicular} onValueChange={(value) => setCtrlVehicular(value ?? "")}>
              <SelectTrigger id="ctrlVehicular" className="w-full" aria-label="Control vehicular">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {catalogs.ctrlVehiculares.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="barreras"
              aria-label="Barreras"
              checked={barreras}
              onCheckedChange={(checked) => setBarreras(!!checked)}
            />
            <Label htmlFor="barreras">Barreras</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="portones"
              aria-label="Portones"
              checked={portones}
              onCheckedChange={(checked) => setPortones(!!checked)}
            />
            <Label htmlFor="portones">Portones</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="molinetes"
              aria-label="Molinetes"
              checked={molinetes}
              onCheckedChange={(checked) => setMolinetes(!!checked)}
            />
            <Label htmlFor="molinetes">Molinetes</Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="biometria"
              aria-label="Biometria"
              checked={biometria}
              onCheckedChange={(checked) => setBiometria(!!checked)}
            />
            <Label htmlFor="biometria">Biometria</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="rfid"
              aria-label="RFID"
              checked={rfid}
              onCheckedChange={(checked) => setRfid(!!checked)}
            />
            <Label htmlFor="rfid">RFID</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="qr"
              aria-label="QR"
              checked={qr}
              onCheckedChange={(checked) => setQr(!!checked)}
            />
            <Label htmlFor="qr">QR</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="app"
              aria-label="App de invitados"
              checked={app}
              onCheckedChange={(checked) => setApp(!!checked)}
            />
            <Label htmlFor="app">App de invitados</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="validManual"
              aria-label="Validacion manual"
              checked={validManual}
              onCheckedChange={(checked) => setValidManual(!!checked)}
            />
            <Label htmlFor="validManual">Validacion manual</Label>
          </div>
        </div>
      </div>

      {/* Bloque 3: Protocolos */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="protoVisitas">Protocolo de visitas</Label>
          <Textarea
            id="protoVisitas"
            value={protoVisitas}
            onChange={(e) => setProtoVisitas(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="protoProv">Protocolo de proveedores</Label>
          <Textarea
            id="protoProv"
            value={protoProv}
            onChange={(e) => setProtoProv(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="registroNube"
            aria-label="Registro en nube"
            checked={registroNube}
            onCheckedChange={(checked) => setRegistroNube(!!checked)}
          />
          <Label htmlFor="registroNube">Registro en nube</Label>
        </div>
      </div>

      {/* Bloque 4: Equipamiento y monitoreo */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="camaras">Camaras asociadas</Label>
          <Input id="camaras" value={camaras} onChange={(e) => setCamaras(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="lpr"
              aria-label="LPR"
              checked={lpr}
              onCheckedChange={(checked) => setLpr(!!checked)}
            />
            <Label htmlFor="lpr">LPR</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ups"
              aria-label="UPS"
              checked={ups}
              onCheckedChange={(checked) => setUps(!!checked)}
            />
            <Label htmlFor="ups">UPS</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="generador"
              aria-label="Generador"
              checked={generador}
              onCheckedChange={(checked) => setGenerador(!!checked)}
            />
            <Label htmlFor="generador">Generador</Label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="congestion">Nivel de congestion</Label>
          <Select value={congestion} onValueChange={(value) => setCongestion(value ?? "")}>
            <SelectTrigger id="congestion" className="w-full" aria-label="Nivel de congestion">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.congestiones.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trazabilidad">Trazabilidad</Label>
          <Select value={trazabilidad} onValueChange={(value) => setTrazabilidad(value ?? "")}>
            <SelectTrigger id="trazabilidad" className="w-full" aria-label="Trazabilidad">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catalogs.trazabilidades.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bloque 5: Hallazgos */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vulns">Vulnerabilidades detectadas</Label>
          <Textarea id="vulns" value={vulns} onChange={(e) => setVulns(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="riesgo">Riesgo asociado</Label>
          <Textarea id="riesgo" value={riesgo} onChange={(e) => setRiesgo(e.target.value)} />
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
