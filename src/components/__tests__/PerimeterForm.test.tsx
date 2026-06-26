import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PerimeterForm, PerimeterFormCatalogs } from "@/components/PerimeterForm";
import { PerimeterSectorEntry } from "@/lib/api";

const catalogs: PerimeterFormCatalogs = {
  cerramientos: ["Muro", "Alambrado", "Reja", "Doble cerco", "Cerco vivo", "Canal", "Medianera", "Mixto"],
  estados: ["Correcto", "Regular", "Deficiente", "Critico"],
  escalabilidades: ["Baja", "Media", "Alta"],
  continuidades: ["Completa", "Con interrupciones", "Deficiente"],
  vegetaciones: ["Sin vegetacion", "Controlada", "Descontrolada"],
  visibilidades: ["Buena", "Regular", "Pobre"],
  iluminaciones: ["Correcto", "Regular", "Deficiente", "Critico"],
  criticidades: ["Baja", "Media", "Alta", "Critica"],
};

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

function buildEntry(overrides: Partial<PerimeterSectorEntry> = {}): PerimeterSectorEntry {
  return {
    id: "1",
    projectId: "p1",
    sector: "Tramo Norte",
    longitud: 120,
    cerramiento: "Muro",
    altura: 2.5,
    estado: "Correcto",
    escalabilidad: "Baja",
    continuidad: "Completa",
    vegetacion: "Controlada",
    visibilidad: "Buena",
    iluminacion: "Correcto",
    camaras: "2 camaras PTZ",
    sensores: "Sensor de movimiento",
    cercoElec: true,
    concertina: false,
    sendero: true,
    rondines: "Cada 2 horas",
    vulns: "Punto ciego en esquina",
    obsPer: "Revisar mantenimiento",
    criticidad: "Media",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("PerimeterForm", () => {
  it("no permite submit si falta sector", async () => {
    const onSubmit = jest.fn();
    render(<PerimeterForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el sector es requerido/i)).toBeInTheDocument();
  });

  it("llama a onSubmit con el body esperado al completar todos los campos", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<PerimeterForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^sector$/i), "Tramo Norte");
    await userEvent.type(screen.getByLabelText(/longitud/i), "120");
    await selectOption(/^cerramiento$/i, "Muro");
    await userEvent.type(screen.getByLabelText(/^altura/i), "2.5");
    await selectOption(/^estado$/i, "Correcto");
    await selectOption(/^escalabilidad$/i, "Baja");
    await selectOption(/^continuidad$/i, "Completa");
    await selectOption(/^vegetacion$/i, "Controlada");
    await selectOption(/^visibilidad$/i, "Buena");
    await selectOption(/^iluminacion$/i, "Correcto");
    await userEvent.type(screen.getByLabelText(/^camaras$/i), "2 camaras PTZ");
    await userEvent.type(screen.getByLabelText(/^sensores$/i), "Sensor de movimiento");
    await userEvent.click(screen.getByRole("checkbox", { name: /cerco electrico/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /concertina/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /sendero/i }));
    await userEvent.type(screen.getByLabelText(/rondines/i), "Cada 2 horas");
    await userEvent.type(screen.getByLabelText(/^vulnerabilidades$/i), "Punto ciego en esquina");
    await userEvent.type(screen.getByLabelText(/observaciones/i), "Revisar mantenimiento");
    await selectOption(/^criticidad$/i, "Media");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody).toEqual({
      sector: "Tramo Norte",
      longitud: 120,
      cerramiento: "Muro",
      altura: 2.5,
      estado: "Correcto",
      escalabilidad: "Baja",
      continuidad: "Completa",
      vegetacion: "Controlada",
      visibilidad: "Buena",
      iluminacion: "Correcto",
      camaras: "2 camaras PTZ",
      sensores: "Sensor de movimiento",
      cercoElec: true,
      concertina: true,
      sendero: true,
      rondines: "Cada 2 horas",
      vulns: "Punto ciego en esquina",
      obsPer: "Revisar mantenimiento",
      criticidad: "Media",
    });
    expect(typeof sentBody.longitud).toBe("number");
    expect(typeof sentBody.altura).toBe("number");
    expect(typeof sentBody.cercoElec).toBe("boolean");
    expect(typeof sentBody.concertina).toBe("boolean");
    expect(typeof sentBody.sendero).toBe("boolean");
  }, 15000);

  it("precarga los 18 campos a partir de initial, incluyendo los 3 checkbox", () => {
    const entry = buildEntry();
    render(<PerimeterForm catalogs={catalogs} initial={entry} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/^sector$/i)).toHaveValue("Tramo Norte");
    expect(screen.getByLabelText(/longitud/i)).toHaveValue(120);
    expect(screen.getByText("Muro")).toBeInTheDocument();
    expect(screen.getByLabelText(/^altura/i)).toHaveValue(2.5);
    expect(screen.getAllByText("Correcto").length).toBeGreaterThan(0);
    expect(screen.getByText("Baja")).toBeInTheDocument();
    expect(screen.getByText("Completa")).toBeInTheDocument();
    expect(screen.getByText("Controlada")).toBeInTheDocument();
    expect(screen.getByText("Buena")).toBeInTheDocument();
    expect(screen.getByLabelText(/^camaras$/i)).toHaveValue("2 camaras PTZ");
    expect(screen.getByLabelText(/^sensores$/i)).toHaveValue("Sensor de movimiento");
    expect(screen.getByRole("checkbox", { name: /cerco electrico/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /concertina/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox", { name: /sendero/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText(/rondines/i)).toHaveValue("Cada 2 horas");
    expect(screen.getByLabelText(/^vulnerabilidades$/i)).toHaveValue("Punto ciego en esquina");
    expect(screen.getByLabelText(/observaciones/i)).toHaveValue("Revisar mantenimiento");
    expect(screen.getByText("Media")).toBeInTheDocument();
  });

  it("puebla el select de cerramiento con los valores del catalogo recibido", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^cerramiento$/i));
    expect(await screen.findByRole("option", { name: "Mixto" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(8);
  });

  it("puebla el select de estado con los valores del catalogo recibido", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^estado$/i));
    expect(await screen.findByRole("option", { name: "Critico" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("puebla el select de escalabilidad con los valores del catalogo recibido (sin Critica)", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^escalabilidad$/i));
    expect(await screen.findByRole("option", { name: "Alta" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("puebla el select de continuidad con los valores del catalogo recibido", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^continuidad$/i));
    expect(await screen.findByRole("option", { name: "Deficiente" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("puebla el select de vegetacion con los valores del catalogo recibido", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^vegetacion$/i));
    expect(await screen.findByRole("option", { name: "Descontrolada" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("puebla el select de visibilidad con los valores del catalogo recibido", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^visibilidad$/i));
    expect(await screen.findByRole("option", { name: "Pobre" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("puebla el select de iluminacion con los valores de su propio catalogo (independiente de estado)", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^iluminacion$/i));
    expect(await screen.findByRole("option", { name: "Critico" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("puebla el select de criticidad con los valores del catalogo recibido", async () => {
    render(<PerimeterForm catalogs={catalogs} onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByLabelText(/^criticidad$/i));
    expect(await screen.findByRole("option", { name: "Critica" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("envia los 3 checkbox como false por default si no se tocan", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<PerimeterForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^sector$/i), "Tramo Sur");
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.cercoElec).toBe(false);
    expect(sentBody.concertina).toBe(false);
    expect(sentBody.sendero).toBe(false);
  });
});
