import { render, screen } from "@testing-library/react";
import { AssetCriticalityBadge } from "@/components/AssetCriticalityBadge";

describe("AssetCriticalityBadge", () => {
  const cases: { valor: string; colorClass: string }[] = [
    { valor: "Baja", colorClass: "bg-green-500/15" },
    { valor: "Media", colorClass: "bg-yellow-500/15" },
    { valor: "Alta", colorClass: "bg-orange-500/15" },
    { valor: "Critica", colorClass: "bg-red-500/15" },
  ];

  it.each(cases)("renderiza el valor $valor con su color", ({ valor, colorClass }) => {
    render(<AssetCriticalityBadge valor={valor} />);
    const badge = screen.getByText(valor);
    expect(badge.className).toContain(colorClass);
  });

  it("renderiza un fallback neutral si el valor es vacio o no reconocido", () => {
    render(<AssetCriticalityBadge valor="" />);
    expect(screen.getByText(/sin dato/i)).toBeInTheDocument();
  });

  it("renderiza un fallback neutral para un valor no reconocido", () => {
    render(<AssetCriticalityBadge valor="Inexistente" />);
    expect(screen.getByText(/sin dato/i)).toBeInTheDocument();
  });
});
