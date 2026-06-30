import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessPointForm, AccessPointFormCatalogs } from "@/components/AccessPointForm";
import { AccessPointEntry } from "@/lib/api";

const catalogs: AccessPointFormCatalogs = {
  tipos: ["Principal", "Secundario", "Servicio", "Proveedores", "Emergencia", "Peatonal", "Vehicular"],
  ctrlPeatonales: ["Completo", "Parcial", "Inexistente"],
  ctrlVehiculares: ["Completo", "Parcial", "Inexistente"],
  congestiones: ["Baja", "Media", "Alta"],
  trazabilidades: ["Completa", "Parcial", "Nula"],
};

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

function buildEntry(overrides: Partial<AccessPointEntry> = {}): AccessPointEntry {
  return {
    id: "1",
    projectId: "p1",
    nombre: "Acceso Principal",
    tipo: "Principal",
    carriles: 2,
    uso: "Ingreso vehicular",
    barreras: true,
    portones: false,
    molinetes: true,
    biometria: true,
    rfid: false,
    qr: true,
    app: false,
    validManual: true,
    registroNube: false,
    protoVisitas: "Protocolo formal de visitas",
    protoProv: "Protocolo de proveedores",
    ctrlPeatonal: "Completo",
    ctrlVehicular: "Parcial",
    camaras: "4 camaras PTZ",
    lpr: true,
    ups: false,
    generador: true,
    congestion: "Media",
    trazabilidad: "Completa",
    vulns: "Punto ciego al costado norte",
    riesgo: "Riesgo de ingreso no autorizado",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("AccessPointForm", () => {
  // Criterio 1: no permite submit si falta nombre
  it("no permite submit si falta nombre — muestra error inline y no llama a onSubmit", async () => {
    const onSubmit = jest.fn();
    render(<AccessPointForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el nombre es requerido/i)).toBeInTheDocument();
  });

  // Criterio 2: envia body esperado con todos los campos
  it("llama a onSubmit con el body esperado al completar todos los campos", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AccessPointForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/nombre del acceso/i), "Acceso Principal");
    await userEvent.type(screen.getByLabelText(/carriles/i), "2");
    await userEvent.type(screen.getByLabelText(/uso/i), "Ingreso vehicular");
    await selectOption(/^tipo$/i, "Principal");
    await selectOption(/^control peatonal$/i, "Completo");
    await selectOption(/^control vehicular$/i, "Parcial");

    await userEvent.click(screen.getByRole("checkbox", { name: /^barreras$/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /^biometria$/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /^lpr$/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /^generador$/i }));

    await userEvent.type(screen.getByLabelText(/protocolo de visitas/i), "Protocolo formal");
    await userEvent.type(screen.getByLabelText(/protocolo de proveedores/i), "Protocolo prov");
    await userEvent.type(screen.getByLabelText(/camaras asociadas/i), "4 camaras PTZ");
    await userEvent.type(screen.getByLabelText(/vulnerabilidades detectadas/i), "Sin vulnerabilidades");
    await userEvent.type(screen.getByLabelText(/riesgo asociado/i), "Riesgo bajo");

    await selectOption(/^nivel de congestion$/i, "Media");
    await selectOption(/^trazabilidad$/i, "Completa");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.nombre).toBe("Acceso Principal");
    expect(typeof sentBody.carriles).toBe("number");
    expect(sentBody.carriles).toBe(2);
    expect(typeof sentBody.barreras).toBe("boolean");
    expect(typeof sentBody.portones).toBe("boolean");
    expect(typeof sentBody.molinetes).toBe("boolean");
    expect(typeof sentBody.biometria).toBe("boolean");
    expect(typeof sentBody.rfid).toBe("boolean");
    expect(typeof sentBody.qr).toBe("boolean");
    expect(typeof sentBody.app).toBe("boolean");
    expect(typeof sentBody.validManual).toBe("boolean");
    expect(typeof sentBody.registroNube).toBe("boolean");
    expect(typeof sentBody.lpr).toBe("boolean");
    expect(typeof sentBody.ups).toBe("boolean");
    expect(typeof sentBody.generador).toBe("boolean");
    expect(sentBody.tipo).toBe("Principal");
    expect(sentBody.ctrlPeatonal).toBe("Completo");
    expect(sentBody.ctrlVehicular).toBe("Parcial");
    expect(sentBody.congestion).toBe("Media");
    expect(sentBody.trazabilidad).toBe("Completa");
  }, 20000);

  // Criterio 3: precarga los 24 campos con initial
  it("precarga los 24 campos a partir de initial, incluyendo los 12 checkbox", () => {
    const entry = buildEntry();
    render(<AccessPointForm catalogs={catalogs} initial={entry} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/nombre del acceso/i)).toHaveValue("Acceso Principal");
    expect(screen.getByLabelText(/carriles/i)).toHaveValue(2);
    expect(screen.getByLabelText(/uso/i)).toHaveValue("Ingreso vehicular");
    expect(screen.getByText("Principal")).toBeInTheDocument();
    expect(screen.getByLabelText(/protocolo de visitas/i)).toHaveValue("Protocolo formal de visitas");
    expect(screen.getByLabelText(/protocolo de proveedores/i)).toHaveValue("Protocolo de proveedores");
    expect(screen.getByLabelText(/camaras asociadas/i)).toHaveValue("4 camaras PTZ");
    expect(screen.getByLabelText(/vulnerabilidades detectadas/i)).toHaveValue("Punto ciego al costado norte");
    expect(screen.getByLabelText(/riesgo asociado/i)).toHaveValue("Riesgo de ingreso no autorizado");

    // Checkboxes
    expect(screen.getByRole("checkbox", { name: /^barreras$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^portones$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^molinetes$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^biometria$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^rfid$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^qr$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^app de invitados$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^validacion manual$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^registro en nube$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^lpr$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^ups$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^generador$/i })).toHaveAttribute("aria-checked", "true");
  });

  // Criterio 4: sin tocar checkboxes, los 12 van como false
  it("sin tocar ningun Checkbox envia los 12 como false (default, no undefined)", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AccessPointForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/nombre del acceso/i), "Acceso Test");
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.barreras).toBe(false);
    expect(sentBody.portones).toBe(false);
    expect(sentBody.molinetes).toBe(false);
    expect(sentBody.biometria).toBe(false);
    expect(sentBody.rfid).toBe(false);
    expect(sentBody.qr).toBe(false);
    expect(sentBody.app).toBe(false);
    expect(sentBody.validManual).toBe(false);
    expect(sentBody.registroNube).toBe(false);
    expect(sentBody.lpr).toBe(false);
    expect(sentBody.ups).toBe(false);
    expect(sentBody.generador).toBe(false);
  });

  // Criterio 5: puebla los 5 selects con catálogos independientes
  it("puebla los 5 selects con los valores de sus respectivos catalogos (mocks independientes)", async () => {
    render(<AccessPointForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^control peatonal$/i));
    expect(await screen.findByRole("option", { name: "Inexistente" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  // Criterio 6: accesos_tipo devuelve exactamente 7 opciones terminando en Vehicular
  it("puebla el select de tipo con exactamente 7 opciones terminando en Vehicular", async () => {
    render(<AccessPointForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^tipo$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(7);
    expect(options[options.length - 1]).toHaveTextContent("Vehicular");
  });

  // Criterio 7: accesos_congestion devuelve 3 opciones (Baja, Media, Alta), sin Critica
  it("puebla el select de congestion con exactamente 3 opciones (Baja, Media, Alta), sin Critica", async () => {
    render(<AccessPointForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^nivel de congestion$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(3);
    const texts = options.map((o) => o.textContent?.trim());
    expect(texts).toEqual(["Baja", "Media", "Alta"]);
    expect(texts).not.toContain("Critica");
  });
});
