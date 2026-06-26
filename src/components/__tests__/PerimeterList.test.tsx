import { render, screen } from "@testing-library/react";
import { PerimeterList } from "@/components/PerimeterList";
import { PerimeterSectorEntry } from "@/lib/api";

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

describe("PerimeterList", () => {
  it("muestra el estado vacio con CTA cuando la lista es [], sin mostrarlo como error", () => {
    render(<PerimeterList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/todavia no hay tramos perimetrales cargados/i)).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("renderiza una fila/card por entrada, en el mismo orden en que llegan (sin reordenar)", () => {
    const entries = [
      buildEntry({ id: "2", sector: "Tramo Z baja criticidad", criticidad: "Baja" }),
      buildEntry({ id: "1", sector: "Tramo A critica", criticidad: "Critica" }),
    ];
    render(<PerimeterList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const rows = screen.getAllByText(/^Tramo (Z baja criticidad|A critica)$/);
    expect(rows[0]).toHaveTextContent("Tramo Z baja criticidad");
  });

  it("muestra el badge de criticidad correcto para los 4 valores posibles y un fallback neutral", () => {
    const entries = [
      buildEntry({ id: "1", sector: "S1", criticidad: "Baja" }),
      buildEntry({ id: "2", sector: "S2", criticidad: "Media" }),
      buildEntry({ id: "3", sector: "S3", criticidad: "Alta" }),
      buildEntry({ id: "4", sector: "S4", criticidad: "Critica" }),
      buildEntry({ id: "5", sector: "S5", criticidad: null }),
    ];
    render(<PerimeterList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Baja").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Media").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Critica").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sin dato/i).length).toBeGreaterThan(0);
  });

  it("usa clases mobile-first: cards visibles en mobile (md:hidden), tabla solo desde md (hidden md:block)", () => {
    render(<PerimeterList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByTestId("perimeter-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("perimeter-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:block");
  });

  it("la tabla desktop muestra exactamente las columnas Sector/Cerramiento/Altura/Estado/Iluminacion/Criticidad/Acciones en ese orden", () => {
    render(<PerimeterList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const table = screen.getByTestId("perimeter-table");
    const headers = Array.from(table.querySelectorAll("th")).map((th) => th.textContent?.trim());
    expect(headers).toEqual(["Sector", "Cerramiento", "Altura", "Estado", "Iluminacion", "Criticidad", "Acciones"]);
  });
});
