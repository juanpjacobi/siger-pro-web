import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MethodologyList } from "@/components/MethodologyList";
import { MethodologyEntry } from "@/lib/api";

function buildEntry(overrides: Partial<MethodologyEntry> = {}): MethodologyEntry {
  return {
    id: "1",
    projectId: "p1",
    enfoque: "Gestion de riesgos",
    activo: true,
    descripcion: "Descripcion base",
    aplicacion: "Aplicacion concreta",
    observaciones: "Observaciones del analista",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("MethodologyList", () => {
  it("muestra el estado vacio cuando no hay entradas", () => {
    render(
      <MethodologyList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} onToggleActivo={jest.fn()} />,
    );
    expect(screen.getByText(/todavia no hay enfoques cargados/i)).toBeInTheDocument();
  });

  it("renderiza una card y una fila por cada entrada, con el estado de activo reflejado", () => {
    const entries = [
      buildEntry({ id: "1", enfoque: "Gestion de riesgos", activo: true }),
      buildEntry({ id: "2", enfoque: "CPTED / diseno ambiental seguro", activo: false }),
    ];
    render(
      <MethodologyList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} onToggleActivo={jest.fn()} />,
    );

    expect(screen.getAllByText("Gestion de riesgos")).toHaveLength(2);
    expect(screen.getAllByText("CPTED / diseno ambiental seguro")).toHaveLength(2);

    const checkboxes = screen.getAllByRole("checkbox", { name: /activo/i });
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "true");
    expect(checkboxes[1]).toHaveAttribute("aria-checked", "false");
  });

  it("togglear activo dispara onToggleActivo con el id y el nuevo valor", async () => {
    const onToggleActivo = jest.fn();
    const entries = [buildEntry({ id: "1", activo: true })];
    render(
      <MethodologyList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} onToggleActivo={onToggleActivo} />,
    );

    const checkboxes = screen.getAllByRole("checkbox", { name: /activo/i });
    await userEvent.click(checkboxes[0]);

    expect(onToggleActivo).toHaveBeenCalledWith(entries[0], false);
  });

  it("usa clases mobile-first: cards visibles en mobile (md:hidden), tabla solo desde md (hidden md:block)", () => {
    render(
      <MethodologyList
        entries={[buildEntry()]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleActivo={jest.fn()}
      />,
    );

    expect(screen.getByTestId("methodology-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("methodology-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:block");
  });
});
