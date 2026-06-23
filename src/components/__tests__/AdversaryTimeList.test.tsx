import { render, screen } from "@testing-library/react";
import { AdversaryTimeList } from "@/components/AdversaryTimeList";
import { AdversaryTimeEntry } from "@/lib/api";

function buildEntry(overrides: Partial<AdversaryTimeEntry> = {}): AdversaryTimeEntry {
  return {
    id: "1",
    projectId: "p1",
    amenaza: "Robo",
    ti: 10,
    te: 5,
    td: 3,
    tr: 2,
    obs: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ta: 15,
    ts: 5,
    delta: 10,
    res: "Sistema favorable",
    estado: "favorable",
    fav: true,
    msg: "El sistema presenta una relacion favorable...",
    recomendaciones: [],
    ...overrides,
  };
}

describe("AdversaryTimeList", () => {
  it("muestra el estado vacio cuando no hay entradas", () => {
    render(<AdversaryTimeList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/todavia no hay escenarios de tiempos/i)).toBeInTheDocument();
  });

  it("renderiza una card y una fila por cada entrada, con badge de estado", () => {
    const entries = [buildEntry({ id: "1" }), buildEntry({ id: "2", amenaza: "Incendio", estado: "critico" })];
    render(<AdversaryTimeList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Robo")).toHaveLength(2);
    expect(screen.getAllByText("Incendio")).toHaveLength(2);
    expect(screen.getAllByText("Critico").length).toBeGreaterThan(0);
  });

  it("usa clases mobile-first: cards visibles en mobile (md:hidden), tabla solo desde md (hidden md:table)", () => {
    render(<AdversaryTimeList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByTestId("adversary-time-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("adversary-time-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:table");
  });
});
