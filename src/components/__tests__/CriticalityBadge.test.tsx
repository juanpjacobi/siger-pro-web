import { render, screen } from "@testing-library/react";
import { CriticalityBadge } from "@/components/CriticalityBadge";

describe("CriticalityBadge", () => {
  const cases: { valor: string; colorClass: string }[] = [
    { valor: "Baja", colorClass: "bg-green-500/15" },
    { valor: "Media", colorClass: "bg-yellow-500/15" },
    { valor: "Alta", colorClass: "bg-orange-500/15" },
    { valor: "Critica", colorClass: "bg-red-500/15" },
  ];

  it.each(cases)("renderiza el valor $valor con su color", ({ valor, colorClass }) => {
    render(<CriticalityBadge valor={valor} />);
    const badge = screen.getByText(valor);
    expect(badge.className).toContain(colorClass);
  });

  it("renderiza un fallback neutral si el valor es vacio o no reconocido", () => {
    render(<CriticalityBadge valor="" />);
    expect(screen.getByText(/sin dato/i)).toBeInTheDocument();
  });

  it("renderiza un fallback neutral para un valor no reconocido", () => {
    render(<CriticalityBadge valor="Inexistente" />);
    expect(screen.getByText(/sin dato/i)).toBeInTheDocument();
  });
});
