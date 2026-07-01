import { render, screen } from "@testing-library/react";
import { LightingSectorList } from "@/components/LightingSectorList";
import { IlluminationEntry } from "@/lib/api";

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
    oscuras: null,
    fotocelula: false,
    timer: false,
    cctv: null,
    perimetro: null,
    recomendacion: null,
    criticidad: "Alta",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("LightingSectorList", () => {
  // Criterio 9: renderiza una fila/card por entrada en el mismo orden que llegan (sin reordenar)
  it("renderiza una fila/card por entrada en el mismo orden en que llegan (sin reordenar)", () => {
    const entries = [
      buildEntry({ id: "uuid-z", sector: "Sector Z" }),
      buildEntry({ id: "uuid-a", sector: "Sector A" }),
    ];
    render(<LightingSectorList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const sectors = screen.getAllByText(/^Sector [ZA]$/);
    expect(sectors[0]).toHaveTextContent("Sector Z");
    expect(sectors[1]).toHaveTextContent("Sector A");
  });

  // Criterio 10: muestra estado vacío con CTA cuando la lista es []
  it("muestra estado vacio con CTA cuando la lista es [], sin mostrarlo como error", () => {
    render(<LightingSectorList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/todavía no hay sectores de iluminación cargados/i)).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // Criterio 11: muestra CriticalityBadge con valor correcto y fallback para null/undefined
  it("muestra CriticalityBadge correcto para Baja, Media, Alta, Critica y fallback Sin dato para null", () => {
    const entries = [
      buildEntry({ id: "uuid-1", sector: "Sector 1", criticidad: "Baja" }),
      buildEntry({ id: "uuid-2", sector: "Sector 2", criticidad: "Media" }),
      buildEntry({ id: "uuid-3", sector: "Sector 3", criticidad: "Alta" }),
      buildEntry({ id: "uuid-4", sector: "Sector 4", criticidad: "Critica" }),
      buildEntry({ id: "uuid-5", sector: "Sector 5", criticidad: null }),
    ];
    render(<LightingSectorList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Baja").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Media").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Critica").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sin dato/i).length).toBeGreaterThan(0);
  });

  // Criterio 12: muestra sector como identificador principal en cards y tabla
  it("muestra sector como identificador principal en cards y tabla (no el uuid interno id)", () => {
    const entry = buildEntry({ id: "uuid-secreto", sector: "Estacionamiento Sur" });
    render(<LightingSectorList entries={[entry]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Estacionamiento Sur").length).toBeGreaterThan(0);
    expect(screen.queryByText("uuid-secreto")).not.toBeInTheDocument();
  });

  // Criterio 13: en viewport mobile, tabla ausente u oculta (clase hidden)
  it("usa clases mobile-first: cards con md:hidden, tabla con hidden md:block", () => {
    render(<LightingSectorList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByTestId("lighting-sector-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("lighting-sector-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:block");
  });

  // Criterio 14: tabla desktop muestra exactamente las columnas Sector/Tipo/Estado/Cobertura/Criticidad/Acciones
  it("la tabla desktop muestra exactamente las columnas Sector/Tipo/Estado/Cobertura/Criticidad/Acciones en ese orden", () => {
    render(<LightingSectorList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const table = screen.getByTestId("lighting-sector-table");
    const headers = Array.from(table.querySelectorAll("th")).map((th) => th.textContent?.trim());
    expect(headers).toEqual(["Sector", "Tipo", "Estado", "Cobertura", "Criticidad", "Acciones"]);
  });

  // Criterio 15: etiquetas "Fotocélula" y "Timer" se muestran solo cuando su valor es true
  it("muestra etiquetas Fotocélula y Timer en card solo cuando el valor es true", () => {
    const entries = [
      buildEntry({ id: "uuid-1", sector: "Con fotocelula y timer", fotocelula: true, timer: true }),
      buildEntry({ id: "uuid-2", sector: "Sin fotocelula ni timer", fotocelula: false, timer: false }),
    ];
    render(<LightingSectorList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const cards = screen.getByTestId("lighting-sector-cards");
    const allFotocelula = cards.querySelectorAll("[data-label='fotocelula']");
    const allTimer = cards.querySelectorAll("[data-label='timer']");

    expect(allFotocelula).toHaveLength(1);
    expect(allTimer).toHaveLength(1);
  });
});
