import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetForm, AssetFormCatalogs } from "@/components/AssetForm";
import { AssetEntry } from "@/lib/api";

const catalogs: AssetFormCatalogs = {
  tipos: ["Personas", "Viviendas", "Otro"],
  valoresCualitativos: ["Bajo", "Medio", "Alto", "Critico"],
  exposiciones: ["Baja", "Media", "Alta", "Critica"],
  prioridades: ["Baja", "Media", "Alta", "Critica"],
};

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

function buildEntry(overrides: Partial<AssetEntry> = {}): AssetEntry {
  return {
    id: "1",
    projectId: "p1",
    nombre: "Sala de servidores",
    tipo: "Sistemas tecnologicos",
    ubicacion: "Piso 3",
    valorCualitativo: "Alto",
    valorEconomico: 50000,
    exposicion: "Alta",
    amenazas: "Robo, incendio",
    vulnerabilidades: "Falta de control de acceso",
    controles: "Camaras, alarma",
    impacto: "Perdida de informacion critica",
    prioridad: "Critica",
    obs: "Revisar trimestralmente",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("AssetForm", () => {
  it("no permite submit si falta nombre", async () => {
    const onSubmit = jest.fn();
    render(<AssetForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el nombre es requerido/i)).toBeInTheDocument();
  });

  it("llama a onSubmit con el body esperado al completar todos los campos", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AssetForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^nombre$/i), "Sala de servidores");
    await selectOption(/^tipo$/i, "Personas");
    await userEvent.type(screen.getByLabelText(/ubicacion/i), "Piso 3");
    await selectOption(/valor cualitativo/i, "Alto");
    await userEvent.type(screen.getByLabelText(/valor economico/i), "50000");
    await selectOption(/^exposicion$/i, "Alta");
    await userEvent.type(screen.getByLabelText(/amenazas/i), "Robo, incendio");
    await userEvent.type(screen.getByLabelText(/vulnerabilidades/i), "Falta de control de acceso");
    await userEvent.type(screen.getByLabelText(/controles/i), "Camaras, alarma");
    await userEvent.type(screen.getByLabelText(/impacto/i), "Perdida de informacion critica");
    await selectOption(/^prioridad$/i, "Critica");
    await userEvent.type(screen.getByLabelText(/observaciones/i), "Revisar trimestralmente");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody).toEqual({
      nombre: "Sala de servidores",
      tipo: "Personas",
      ubicacion: "Piso 3",
      valorCualitativo: "Alto",
      valorEconomico: 50000,
      exposicion: "Alta",
      amenazas: "Robo, incendio",
      vulnerabilidades: "Falta de control de acceso",
      controles: "Camaras, alarma",
      impacto: "Perdida de informacion critica",
      prioridad: "Critica",
      obs: "Revisar trimestralmente",
    });
    expect(typeof sentBody.valorEconomico).toBe("number");
  }, 15000);

  it("precarga los 12 campos a partir de initial", () => {
    const entry = buildEntry();
    render(<AssetForm catalogs={catalogs} initial={entry} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/^nombre$/i)).toHaveValue("Sala de servidores");
    expect(screen.getByText("Sistemas tecnologicos")).toBeInTheDocument();
    expect(screen.getByLabelText(/ubicacion/i)).toHaveValue("Piso 3");
    expect(screen.getByText("Alto")).toBeInTheDocument();
    expect(screen.getByLabelText(/valor economico/i)).toHaveValue(50000);
    expect(screen.getAllByText("Alta")).not.toHaveLength(0);
    expect(screen.getByLabelText(/amenazas/i)).toHaveValue("Robo, incendio");
    expect(screen.getByLabelText(/vulnerabilidades/i)).toHaveValue("Falta de control de acceso");
    expect(screen.getByLabelText(/controles/i)).toHaveValue("Camaras, alarma");
    expect(screen.getByLabelText(/impacto/i)).toHaveValue("Perdida de informacion critica");
    expect(screen.getByText("Critica")).toBeInTheDocument();
    expect(screen.getByLabelText(/observaciones/i)).toHaveValue("Revisar trimestralmente");
  });

  it("puebla el select de tipo con los valores del catalogo recibido", async () => {
    render(<AssetForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^tipo$/i));
    expect(await screen.findByRole("option", { name: "Otro" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("puebla el select de valor cualitativo con los valores del catalogo recibido", async () => {
    render(<AssetForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/valor cualitativo/i));
    expect(await screen.findByRole("option", { name: "Critico" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("puebla el select de exposicion con los valores del catalogo recibido", async () => {
    render(<AssetForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^exposicion$/i));
    expect(await screen.findByRole("option", { name: "Critica" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("puebla el select de prioridad con los valores del catalogo recibido", async () => {
    render(<AssetForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^prioridad$/i));
    expect(await screen.findByRole("option", { name: "Critica" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });
});
