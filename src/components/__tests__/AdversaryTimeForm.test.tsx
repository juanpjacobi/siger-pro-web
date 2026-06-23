import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdversaryTimeForm } from "@/components/AdversaryTimeForm";

const catalogs = { amenazas: ["Robo", "Otra"] };

async function selectOption(labelMatcher: RegExp, optionText: string) {
  await userEvent.click(screen.getByLabelText(labelMatcher));
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

describe("AdversaryTimeForm", () => {
  it("no llama a onSubmit si falta la amenaza o algun tiempo", async () => {
    const onSubmit = jest.fn();
    render(<AdversaryTimeForm catalogs={catalogs} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/la amenaza es requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/ti - tiempo de intrusion debe ser un numero mayor o igual a 0/i)).toBeInTheDocument();
  });

  it("llama a onSubmit con el body esperado, sin campos calculados", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AdversaryTimeForm catalogs={catalogs} onSubmit={onSubmit} />);

    await selectOption(/amenaza/i, "Robo");
    await userEvent.type(screen.getByLabelText(/^ti - Tiempo de intrusion$/i), "10");
    await userEvent.type(screen.getByLabelText(/^te - Tiempo de ejecucion$/i), "5");
    await userEvent.type(screen.getByLabelText(/^td - Tiempo de deteccion$/i), "3");
    await userEvent.type(screen.getByLabelText(/^tr - Tiempo de respuesta$/i), "2");

    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const sentBody = onSubmit.mock.calls[0][0];
    expect(sentBody).toMatchObject({ amenaza: "Robo", ti: 10, te: 5, td: 3, tr: 2 });
    expect(sentBody).not.toHaveProperty("delta");
    expect(sentBody).not.toHaveProperty("estado");
  });
});
