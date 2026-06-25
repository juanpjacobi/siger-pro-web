import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectForm } from "@/components/ProjectForm";
import { Project } from "@/lib/api";

const tipos = ["Country", "Industria", "Otro"];

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "1",
    nombre: "Urbanizacion Demo",
    cliente: "Club Sierra Verde",
    tipo: "Country",
    ubicacion: "Ruta 8 km 45",
    fecha: "2026-06-01T00:00:00.000Z",
    profesional: "Juan Perez",
    empresa: "Seguridad SRL",
    responsable: "Maria Gomez",
    superficie: "50000",
    perimetro: "1200",
    lotes: 80,
    habitantes: 300,
    accesos: 2,
    alcance: "Relevamiento integral",
    exclusiones: "No incluye interior",
    normativa: "Ordenanza 123",
    criterioAceptacion: "Riesgo Medio o menor",
    obs: "Demo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ProjectForm", () => {
  it("no llama a onSubmit si falta el nombre", async () => {
    const onSubmit = jest.fn();
    render(<ProjectForm tipos={tipos} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/el nombre del objetivo es requerido/i)).toBeInTheDocument();
  });

  it("llama a onSubmit con el body esperado, con numeros como numeros", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ProjectForm tipos={tipos} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/nombre del objetivo/i), "Proyecto Test");
    await userEvent.type(screen.getByLabelText(/^superficie/i), "1000");
    await userEvent.type(screen.getByLabelText(/^lotes/i), "10");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody.nombre).toBe("Proyecto Test");
    expect(sentBody.superficie).toBe(1000);
    expect(sentBody.lotes).toBe(10);
  });

  it("precarga todos los campos cuando se pasa initial, incluida la fecha en formato YYYY-MM-DD", () => {
    render(<ProjectForm tipos={tipos} initial={buildProject()} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/nombre del objetivo/i)).toHaveValue("Urbanizacion Demo");
    expect(screen.getByLabelText(/^cliente/i)).toHaveValue("Club Sierra Verde");
    expect(screen.getByLabelText(/^fecha/i)).toHaveValue("2026-06-01");
    expect(screen.getByLabelText(/^superficie/i)).toHaveValue(50000);
    expect(screen.getByLabelText(/^lotes/i)).toHaveValue(80);
    expect(screen.getByLabelText(/alcance del informe/i)).toHaveValue("Relevamiento integral");
  });
});
