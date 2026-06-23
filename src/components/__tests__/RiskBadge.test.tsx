import { render, screen } from "@testing-library/react";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskLevel } from "@/lib/api";

describe("RiskBadge", () => {
  const cases: { nivel: RiskLevel; colorClass: string }[] = [
    { nivel: "Bajo", colorClass: "bg-green-100" },
    { nivel: "Medio", colorClass: "bg-yellow-100" },
    { nivel: "Alto", colorClass: "bg-orange-100" },
    { nivel: "Critico", colorClass: "bg-red-100" },
  ];

  it.each(cases)("renderiza el nivel $nivel con su color", ({ nivel, colorClass }) => {
    render(<RiskBadge nivel={nivel} />);
    const badge = screen.getByText(nivel);
    expect(badge.className).toContain(colorClass);
  });
});
