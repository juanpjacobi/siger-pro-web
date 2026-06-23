import { render, screen } from "@testing-library/react";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskLevel } from "@/lib/api";

describe("RiskBadge", () => {
  const cases: { nivel: RiskLevel; colorClass: string }[] = [
    { nivel: "Bajo", colorClass: "bg-green-500/15" },
    { nivel: "Medio", colorClass: "bg-yellow-500/15" },
    { nivel: "Alto", colorClass: "bg-orange-500/15" },
    { nivel: "Critico", colorClass: "bg-red-500/15" },
  ];

  it.each(cases)("renderiza el nivel $nivel con su color", ({ nivel, colorClass }) => {
    render(<RiskBadge nivel={nivel} />);
    const badge = screen.getByText(nivel);
    expect(badge.className).toContain(colorClass);
  });
});
