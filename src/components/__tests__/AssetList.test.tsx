import { render, screen } from "@testing-library/react";
import { AssetList } from "@/components/AssetList";
import { AssetEntry } from "@/lib/api";

function buildEntry(overrides: Partial<AssetEntry> = {}): AssetEntry {
  return {
    id: "1",
    projectId: "p1",
    nombre: "Sala de servidores",
    tipo: "Sistemas tecnologicos",
    ubicacion: "Piso 3",
    valorCualitativo: "Alto",
    valorEconomico: 50000,
    exposicion: "Critica",
    amenazas: "Robo, incendio",
    vulnerabilidades: "Falta de control de acceso",
    controles: "Camaras, alarma",
    impacto: "Perdida de informacion critica",
    prioridad: "Alta",
    obs: "Revisar trimestralmente",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("AssetList", () => {
  it("muestra el estado vacio con CTA cuando la lista es []", () => {
    render(<AssetList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/todavia no hay activos cargados/i)).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("renderiza una fila/card por entrada, en el mismo orden en que llegan", () => {
    const entries = [
      buildEntry({ id: "1", nombre: "Activo critico", exposicion: "Critica" }),
      buildEntry({ id: "2", nombre: "Activo medio", exposicion: "Media" }),
    ];
    render(<AssetList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const rows = screen.getAllByText(/^Activo (critico|medio)$/);
    expect(rows[0]).toHaveTextContent("Activo critico");
  });

  it("muestra exposicion y prioridad cada una con su propio badge", () => {
    const entries = [buildEntry({ exposicion: "Critica", prioridad: "Baja" })];
    render(<AssetList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Critica").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Baja").length).toBeGreaterThan(0);
  });

  it("usa clases mobile-first: cards visibles en mobile (md:hidden), tabla solo desde md (hidden md:block)", () => {
    render(<AssetList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByTestId("asset-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("asset-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:block");
  });
});
