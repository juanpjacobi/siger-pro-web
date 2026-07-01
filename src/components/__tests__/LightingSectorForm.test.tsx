import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LightingSectorForm, LightingSectorFormCatalogs } from "@/components/LightingSectorForm";
import { IlluminationEntry } from "@/lib/api";

const catalogs: LightingSectorFormCatalogs = {
  estados: ["Correcto", "Regular", "Deficiente", "Critico"],
  coberturas: ["Completa", "Parcial", "Deficiente"],
  criticidades: ["Baja", "Media", "Alta", "Critica"],
};

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

function buildEntry(overrides: Partial<IlluminationEntry> = {}): IlluminationEntry {
  return {
    id: "uuid-1",
    projectId: "p1",
    sector: "Estacionamiento Norte",
    tipo: "LED",
    alimentacion: "Red electrica",
    potencia: 150,
    estado: "Correcto",
    cobertura: "Completa",
    oscuras: "Ninguna",
    fotocelula: true,
    timer: false,
    cctv: "CAM-01",
    perimetro: "Tramo Norte",
    recomendacion: "Sin recomendacion",
    criticidad: "Alta",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("LightingSectorForm", () => {
  // Criterio 1: no permite submit si falta sector
  it("no permite submit si falta sector — muestra error inline y no llama a onSubmit", async () => {
    const onSubmit = jest.fn();
    render(<LightingSectorForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el sector es requerido/i)).toBeInTheDocument();
  });

  // Criterio 2: llama a onSubmit con body esperado
  it("llama a onSubmit con el body esperado al completar todos los campos", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<LightingSectorForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^sector$/i), "Estacionamiento Norte");
    await userEvent.type(screen.getByLabelText(/^tipo de luminaria$/i), "LED");
    await userEvent.type(screen.getByLabelText(/^potencia/i), "150");

    await selectOption(/^estado$/i, "Correcto");
    await selectOption(/^cobertura$/i, "Completa");
    await selectOption(/^criticidad$/i, "Alta");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.sector).toBe("Estacionamiento Norte");
    expect(typeof sentBody.potencia).toBe("number");
    expect(sentBody.potencia).toBe(150);
    expect(typeof sentBody.fotocelula).toBe("boolean");
    expect(typeof sentBody.timer).toBe("boolean");
    expect(sentBody.estado).toBe("Correcto");
    expect(sentBody.cobertura).toBe("Completa");
    expect(sentBody.criticidad).toBe("Alta");
  }, 20000);

  // Criterio 3: precarga los 13 campos con initial, incluyendo los 2 checkboxes
  it("precarga los 13 campos a partir de initial, incluyendo los 2 checkbox", () => {
    const entry = buildEntry();
    render(<LightingSectorForm catalogs={catalogs} initial={entry} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/^sector$/i)).toHaveValue("Estacionamiento Norte");
    expect(screen.getByLabelText(/^tipo de luminaria$/i)).toHaveValue("LED");
    expect(screen.getByLabelText(/^potencia/i)).toHaveValue(150);
    expect(screen.getByLabelText(/^alimentacion$/i)).toHaveValue("Red electrica");
    expect(screen.getByLabelText(/^zonas oscuras$/i)).toHaveValue("Ninguna");
    expect(screen.getByLabelText(/^relacion con sistema de monitoreo$/i)).toHaveValue("CAM-01");
    expect(screen.getByLabelText(/^relacion con perimetro$/i)).toHaveValue("Tramo Norte");
    expect(screen.getByLabelText(/^recomendacion$/i)).toHaveValue("Sin recomendacion");

    // Checkboxes — 2 booleanos
    expect(screen.getByRole("checkbox", { name: /^fotocélula$/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: /^timer$/i })).toHaveAttribute("aria-checked", "false");
  });

  // Criterio 4: sin tocar checkboxes envia fotocelula: false y timer: false
  it("sin tocar ningun Checkbox envia fotocelula: false y timer: false (default, no undefined)", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<LightingSectorForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/^sector$/i), "Sector Test");
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.fotocelula).toBe(false);
    expect(sentBody.timer).toBe(false);
  });

  // Criterio 5: puebla los 3 selects con catalogos independientes
  it("puebla los 3 selects con los valores de sus respectivos catalogos (mocks independientes)", async () => {
    render(<LightingSectorForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^estado$/i));
    const estadoOptions = await screen.findAllByRole("option");
    expect(estadoOptions).toHaveLength(4);

    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByLabelText(/^cobertura$/i));
    const coberturaOptions = await screen.findAllByRole("option");
    expect(coberturaOptions).toHaveLength(3);
  });

  // Criterio 6: iluminacion_estado devuelve exactamente 4 opciones en orden Correcto, Regular, Deficiente, Critico
  it("puebla el select de estado con exactamente 4 opciones en orden: Correcto, Regular, Deficiente, Critico", async () => {
    render(<LightingSectorForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^estado$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(4);
    const texts = options.map((o) => o.textContent?.trim());
    expect(texts).toEqual(["Correcto", "Regular", "Deficiente", "Critico"]);
  });

  // Criterio 7: iluminacion_cobertura devuelve exactamente 3 opciones: Completa, Parcial, Deficiente
  it("puebla el select de cobertura con exactamente 3 opciones: Completa, Parcial, Deficiente", async () => {
    render(<LightingSectorForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^cobertura$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(3);
    const texts = options.map((o) => o.textContent?.trim());
    expect(texts).toEqual(["Completa", "Parcial", "Deficiente"]);
  });

  // Criterio 8: iluminacion_criticidad devuelve exactamente 4 opciones: Baja, Media, Alta, Critica
  it("puebla el select de criticidad con exactamente 4 opciones: Baja, Media, Alta, Critica", async () => {
    render(<LightingSectorForm catalogs={catalogs} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/^criticidad$/i));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(4);
    const texts = options.map((o) => o.textContent?.trim());
    expect(texts).toEqual(["Baja", "Media", "Alta", "Critica"]);
  });
});
