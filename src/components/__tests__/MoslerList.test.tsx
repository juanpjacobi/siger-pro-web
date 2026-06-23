import { render, screen } from "@testing-library/react";
import { MoslerList } from "@/components/MoslerList";
import { MoslerEntry } from "@/lib/api";

function buildEntry(overrides: Partial<MoslerEntry> = {}): MoslerEntry {
  return {
    id: "1",
    projectId: "p1",
    amenaza: "Robo",
    amenazaOtra: null,
    sector: "Perimetro",
    bien: null,
    dano: null,
    controles: null,
    f: 1,
    s: 2,
    p: 3,
    e: 1,
    a: 2,
    v: 2,
    medidas: null,
    tipoMedida: null,
    costo: null,
    responsable: null,
    plazo: null,
    residual: null,
    estadoMedida: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    imp: 2,
    dan: 3,
    car: 5,
    prob: 4,
    ev: 20,
    nivel: "Bajo",
    color: "bajo",
    ...overrides,
  };
}

describe("MoslerList", () => {
  it("muestra el estado vacio cuando no hay entradas", () => {
    render(<MoslerList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/todavia no hay entradas mosler/i)).toBeInTheDocument();
  });

  it("renderiza una card y una fila por cada entrada, con badge de nivel", () => {
    const entries = [buildEntry({ id: "1" }), buildEntry({ id: "2", amenaza: "Incendio", nivel: "Critico" })];
    render(<MoslerList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Robo")).toHaveLength(2); // una en card, una en fila de tabla
    expect(screen.getAllByText("Incendio")).toHaveLength(2);
    expect(screen.getAllByText("Critico").length).toBeGreaterThan(0);
  });

  it("usa clases mobile-first: cards visibles en mobile (md:hidden), tabla solo desde md (hidden md:block)", () => {
    render(<MoslerList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByTestId("mosler-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("mosler-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:block");
  });
});
