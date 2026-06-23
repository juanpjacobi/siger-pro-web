import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoslerForm, MoslerFormCatalogs } from "@/components/MoslerForm";

const catalogs: MoslerFormCatalogs = {
  amenazas: ["Robo", "Otra"],
  tiposMedida: ["Fisica", "Electronica"],
  residuales: ["Bajo", "Medio", "Alto", "Critico"],
  estadosMedida: ["Pendiente", "Implementada"],
};

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

describe("MoslerForm", () => {
  it("no llama a onSubmit si falta la amenaza o algun factor", async () => {
    const onSubmit = jest.fn();
    render(<MoslerForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/la amenaza es requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/f - funcion debe ser un numero entre 1 y 5/i)).toBeInTheDocument();
  });

  it("llama a onSubmit con el body esperado, sin campos calculados", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<MoslerForm catalogs={catalogs} onSubmit={onSubmit} />);

    await selectOption(/amenaza/i, "Robo");
    await userEvent.type(screen.getByLabelText(/^F - Funcion$/i), "1");
    await userEvent.type(screen.getByLabelText(/^S - Sustitucion$/i), "2");
    await userEvent.type(screen.getByLabelText(/^P - Profundidad$/i), "3");
    await userEvent.type(screen.getByLabelText(/^E - Extension$/i), "1");
    await userEvent.type(screen.getByLabelText(/^A - Agresion$/i), "2");
    await userEvent.type(screen.getByLabelText(/^V - Vulnerabilidad$/i), "2");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody).toMatchObject({ amenaza: "Robo", F: 1, S: 2, P: 3, E: 1, A: 2, V: 2 });
    expect(sentBody).not.toHaveProperty("ev");
    expect(sentBody).not.toHaveProperty("nivel");
  });
});
