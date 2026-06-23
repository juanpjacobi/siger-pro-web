import { render, screen } from "@testing-library/react";
import { TimeStatusBadge } from "@/components/TimeStatusBadge";
import { AdversaryTimeState } from "@/lib/api";

describe("TimeStatusBadge", () => {
  const cases: { estado: AdversaryTimeState; label: string }[] = [
    { estado: "favorable", label: "Favorable" },
    { estado: "ajustado", label: "Ajustado" },
    { estado: "limite", label: "Limite" },
    { estado: "desfavorable", label: "Desfavorable" },
    { estado: "critico", label: "Critico" },
  ];

  it.each(cases)("renderiza el estado $estado con su etiqueta", ({ estado, label }) => {
    render(<TimeStatusBadge estado={estado} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
