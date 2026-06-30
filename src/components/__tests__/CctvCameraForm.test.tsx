import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CctvCameraForm, CctvCameraFormCatalogs } from "@/components/CctvCameraForm";
import { CctvCameraEntry } from "@/lib/api";

const catalogs: CctvCameraFormCatalogs = {
  tipos: ["Bullet", "Domo", "PTZ", "Termica", "LPR", "Panoramica"],
  estados: ["Optimo", "Aceptable", "Deficiente", "Fuera de servicio"],
  energias: ["Estable", "Inestable", "Falla"],
  conectividades: ["Estable", "Inestable", "Falla"],
  grabaciones: ["24/7", "Eventos", "Sin grabacion"],
  criticidades: ["Baja", "Media", "Alta", "Critica"],
};

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

function buildEntry(overrides: Partial<CctvCameraEntry> = {}): CctvCameraEntry {
  return {
    id: "uuid-1",
    projectId: "p1",
    camId: "CAM-01",
    nombre: "Camara Principal",
    sector: "Sector Norte",
    ubicacion: "Entrada principal",
    tipo: "Domo",
    marca: "Hikvision DS-2CD",
    resolucion: "4MP",
    alcance: 30,
    nocturna: true,
    ir: true,
    cruceLinea: false,
    intrusion: true,
    merodeo: false,
    movimiento: true,
    facial: false,
    patente: false,
    estado: "Optimo",
    suciedad: false,
    desenfoque: false,
    obstruccion: false,
    antivandalica: true,
    energia: "Estable",
    conectividad: "Estable",
    grabacion: "24/7",
    retencion: 30,
    alerta: true,
    obsCCTV: "Sin observaciones",
    criticidad: "Alta",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("CctvCameraForm", () => {
  // Criterio 1: no permite submit si falta camId
  it("no permite submit si falta camId — muestra error inline y no llama a onSubmit", async () => {
    const onSubmit = jest.fn();
    render(<CctvCameraForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el id de cámara es requerido/i)).toBeInTheDocument();
  });

  // Criterio 2: llama a onSubmit con body esperado
  it("llama a onSubmit con el body esperado al completar todos los campos", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CctvCameraForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^id cámara$/i), "CAM-01");
    await userEvent.type(screen.getByLabelText(/^nombre$/i), "Camara Principal");
    await userEvent.type(screen.getByLabelText(/^alcance estimado/i), "30");
    await userEvent.type(screen.getByLabelText(/^retención/i), "30");

    await selectOption(/^tipo$/i, "Domo");
    await selectOption(/^estado de la cámara$/i, "Optimo");
    await selectOption(/^energía$/i, "Estable");
    await selectOption(/^conectividad$/i, "Estable");
    await selectOption(/^grabación$/i, "24/7");
    await selectOption(/^criticidad$/i, "Alta");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.camId).toBe("CAM-01");
    expect(typeof sentBody.alcance).toBe("number");
    expect(sentBody.alcance).toBe(30);
    expect(typeof sentBody.retencion).toBe("number");
    expect(sentBody.retencion).toBe(30);
    expect(typeof sentBody.nocturna).toBe("boolean");
    expect(typeof sentBody.ir).toBe("boolean");
    expect(typeof sentBody.cruceLinea).toBe("boolean");
    expect(typeof sentBody.intrusion).toBe("boolean");
    expect(typeof sentBody.merodeo).toBe("boolean");
    expect(typeof sentBody.movimiento).toBe("boolean");
    expect(typeof sentBody.facial).toBe("boolean");
    expect(typeof sentBody.patente).toBe("boolean");
    expect(typeof sentBody.suciedad).toBe("boolean");
    expect(typeof sentBody.desenfoque).toBe("boolean");
    expect(typeof sentBody.obstruccion).toBe("boolean");
    expect(typeof sentBody.antivandalica).toBe("boolean");
    expect(typeof sentBody.alerta).toBe("boolean");
    expect(sentBody.tipo).toBe("Domo");
    expect(sentBody.estado).toBe("Optimo");
    expect(sentBody.energia).toBe("Estable");
    expect(sentBody.conectividad).toBe("Estable");
    expect(sentBody.grabacion).toBe("24/7");
    expect(sentBody.criticidad).toBe("Alta");
  }, 20000);

  // Criterio 3: precarga los 27 campos con initial, incluyendo los 13 checkbox
  it("precarga los 27 campos a partir de initial, incluyendo los 13 checkbox", () => {
    const entry = buildEntry();
    render(<CctvCameraForm catalogs={catalogs} initial={entry} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/^id cámara$/i)).toHaveValue("CAM-01");
    expect(screen.getByLabelText(/^nombre$/i)).toHaveValue("Camara Principal");
    expect(screen.getByLabelText(/^alcance estimado/i)).toHaveValue(30);
    expect(screen.getByLabelText(/^retención/i)).toHaveValue(30);
    expect(screen.getByLabelText(/^observaciones$/i)).toHaveValue("Sin observaciones");

    // Checkboxes — 13 booleanos
    expect(screen.getByRole("checkbox", { name: /^visión nocturna$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^ir$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^cruce de línea$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^intrusión$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^merodeo$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^movimiento$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^facial$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^patente$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^suciedad$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^desenfoque$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^obstrucción$/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /^protección antivandalica$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^alerta activa$/i })).toHaveAttribute("aria-checked", "true");
  });

  // Criterio 4: sin tocar checkboxes, los 13 van como false
  it("sin tocar ningun Checkbox envia los 13 como false (default, no undefined)", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CctvCameraForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^id cámara$/i), "CAM-01");
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.nocturna).toBe(false);
    expect(sentBody.ir).toBe(false);
    expect(sentBody.cruceLinea).toBe(false);
    expect(sentBody.intrusion).toBe(false);
    expect(sentBody.merodeo).toBe(false);
    expect(sentBody.movimiento).toBe(false);
    expect(sentBody.facial).toBe(false);
    expect(sentBody.patente).toBe(false);
    expect(sentBody.suciedad).toBe(false);
    expect(sentBody.desenfoque).toBe(false);
    expect(sentBody.obstruccion).toBe(false);
    expect(sentBody.antivandalica).toBe(false);
    expect(sentBody.alerta).toBe(false);
  });

  // Criterio 5: puebla los 6 selects con catálogos independientes
  it("puebla los 6 selects con los valores de sus respectivos catalogos (mocks independientes)", async () => {
    render(<CctvCameraForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^energía$/i));
    expect(await screen.findByRole("option", { name: "Falla" })).toBeInTheDocument();
    const energiaOptions = screen.getAllByRole("option");
    expect(energiaOptions).toHaveLength(3);

    // Cerrar y abrir conectividad para verificar independencia
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByLabelText(/^conectividad$/i));
    const conectividadOptions = await screen.findAllByRole("option");
    expect(conectividadOptions).toHaveLength(3);
  });

  // Criterio 6: cctv_tipo devuelve exactamente 6 opciones terminando en Panoramica
  it("puebla el select de tipo con exactamente 6 opciones terminando en Panoramica", async () => {
    render(<CctvCameraForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^tipo$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(6);
    expect(options[options.length - 1]).toHaveTextContent("Panoramica");
  });

  // Criterio 7: cctv_estado devuelve exactamente 4 opciones terminando en "Fuera de servicio"
  it("puebla el select de estado con exactamente 4 opciones terminando en Fuera de servicio (no Critico)", async () => {
    render(<CctvCameraForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^estado de la cámara$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options[options.length - 1]).toHaveTextContent("Fuera de servicio");
    const texts = options.map((o) => o.textContent?.trim());
    expect(texts).not.toContain("Critico");
  });

  // Criterio 8: cctv_grabacion devuelve exactamente 3 opciones: 24/7, Eventos, Sin grabacion
  it("puebla el select de grabacion con exactamente 3 opciones: 24/7, Eventos, Sin grabacion", async () => {
    render(<CctvCameraForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^grabación$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(3);
    const texts = options.map((o) => o.textContent?.trim());
    expect(texts).toEqual(["24/7", "Eventos", "Sin grabacion"]);
  });
});
