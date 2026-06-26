import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MethodologyForm } from "@/components/MethodologyForm";
import { MethodologyEntry } from "@/lib/api";

const enfoques = [
  "Gestion de riesgos",
  "Analisis de vulnerabilidades",
  "Sistema de Proteccion Fisica",
  "Proteccion de activos",
  "Matriz Mosler",
  "Ecuacion de seguridad",
  "Seguridad por capas/anillos",
  "Seguridad perimetral",
  "Seguridad electronica",
  "Sistema de monitoreo",
  "Control de accesos",
  "CPTED / diseno ambiental seguro",
  "Riesgo inicial y residual",
  "Plan de tratamiento del riesgo",
  "Mejora continua",
  "Otro",
];

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

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

describe("MethodologyForm", () => {
  it("no permite submit si falta enfoque", async () => {
    const onSubmit = jest.fn();
    render(<MethodologyForm enfoques={enfoques} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el enfoque es requerido/i)).toBeInTheDocument();
  });

  it("llama a onSubmit con el body esperado al completar todos los campos", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<MethodologyForm enfoques={enfoques} onSubmit={onSubmit} />);

    await selectOption(/enfoque/i, "Matriz Mosler");
    await userEvent.click(screen.getByLabelText(/activo/i));
    await userEvent.type(screen.getByLabelText(/descripcion/i), "Descripcion test");
    await userEvent.type(screen.getByLabelText(/aplicacion/i), "Aplicacion test");
    await userEvent.type(screen.getByLabelText(/observaciones/i), "Observaciones test");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody).toEqual({
      enfoque: "Matriz Mosler",
      activo: true,
      descripcion: "Descripcion test",
      aplicacion: "Aplicacion test",
      observaciones: "Observaciones test",
    });
  });

  it("precarga los 5 campos a partir de initial", () => {
    const entry = buildEntry();
    render(<MethodologyForm enfoques={enfoques} initial={entry} onSubmit={jest.fn()} />);

    expect(screen.getByText("Gestion de riesgos")).toBeInTheDocument();
    expect(screen.getByLabelText(/activo/i)).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText(/descripcion/i)).toHaveValue("Descripcion base");
    expect(screen.getByLabelText(/aplicacion/i)).toHaveValue("Aplicacion concreta");
    expect(screen.getByLabelText(/observaciones/i)).toHaveValue("Observaciones del analista");
  });

  it("puebla el select de enfoque con los valores del catalogo recibido", async () => {
    render(<MethodologyForm enfoques={enfoques} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByLabelText(/enfoque/i));
    expect(await screen.findByRole("option", { name: "Otro" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(16);
  });
});
