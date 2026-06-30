import { render, screen } from "@testing-library/react";
import { AccessPointList } from "@/components/AccessPointList";
import { AccessPointEntry } from "@/lib/api";

function buildEntry(overrides: Partial<AccessPointEntry> = {}): AccessPointEntry {
  return {
    id: "1",
    projectId: "p1",
    nombre: "Acceso Principal",
    tipo: "Principal",
    carriles: 2,
    uso: "Ingreso vehicular",
    barreras: true,
    portones: false,
    molinetes: false,
    biometria: true,
    rfid: false,
    qr: false,
    app: false,
    validManual: false,
    registroNube: false,
    protoVisitas: "Protocolo visitas",
    protoProv: null,
    ctrlPeatonal: "Completo",
    ctrlVehicular: "Parcial",
    camaras: "2 camaras",
    lpr: true,
    ups: false,
    generador: false,
    congestion: "Media",
    trazabilidad: "Completa",
    vulns: null,
    riesgo: "Riesgo bajo",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("AccessPointList", () => {
  // Criterio 8: renderiza fila/card por entrada en el mismo orden que llegan
  it("renderiza una fila/card por entrada en el mismo orden en que llegan (sin reordenar)", () => {
    const entries = [
      buildEntry({ id: "2", nombre: "Acceso Z secundario", congestion: "Baja" }),
      buildEntry({ id: "1", nombre: "Acceso A principal", congestion: "Alta" }),
    ];
    render(<AccessPointList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const names = screen.getAllByText(/^Acceso (Z secundario|A principal)$/);
    expect(names[0]).toHaveTextContent("Acceso Z secundario");
    expect(names[1]).toHaveTextContent("Acceso A principal");
  });

  // Criterio 9: muestra estado vacío con CTA cuando lista es []
  it("muestra estado vacio con CTA cuando la lista es [], sin mostrarlo como error", () => {
    render(<AccessPointList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/todavia no hay accesos cargados/i)).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // Criterio 10: muestra CriticalityBadge con valor correcto para Baja/Media/Alta y fallback para null
  it("muestra CriticalityBadge correcto para Baja, Media, Alta y fallback Sin dato para null", () => {
    const entries = [
      buildEntry({ id: "1", nombre: "E1", congestion: "Baja" }),
      buildEntry({ id: "2", nombre: "E2", congestion: "Media" }),
      buildEntry({ id: "3", nombre: "E3", congestion: "Alta" }),
      buildEntry({ id: "4", nombre: "E4", congestion: null }),
    ];
    render(<AccessPointList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Baja").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Media").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alta").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sin dato/i).length).toBeGreaterThan(0);
  });

  // Criterio 11: biometria y lpr se muestran como Si/No en tabla desktop
  it("muestra biometria y lpr como Si/No en la tabla desktop", () => {
    const entries = [
      buildEntry({ id: "1", nombre: "E1", biometria: true, lpr: false }),
      buildEntry({ id: "2", nombre: "E2", biometria: false, lpr: true }),
    ];
    render(<AccessPointList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const table = screen.getByTestId("access-point-table");
    expect(table).toBeInTheDocument();
    const rows = table.querySelectorAll("tbody tr");
    expect(rows[0].textContent).toContain("Si");
    expect(rows[0].textContent).toContain("No");
    expect(rows[1].textContent).toContain("No");
    expect(rows[1].textContent).toContain("Si");
  });

  // Criterio 12: en mobile, tabla ausente u oculta (clase hidden)
  it("usa clases mobile-first: cards con md:hidden, tabla con hidden md:block", () => {
    render(<AccessPointList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByTestId("access-point-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("access-point-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:block");
  });

  // Criterio 13: columnas exactas Nombre/Tipo/Biometria/LPR/Congestion/Acciones en ese orden
  it("la tabla desktop muestra exactamente las columnas Nombre/Tipo/Biometria/LPR/Congestion/Acciones en ese orden", () => {
    render(<AccessPointList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const table = screen.getByTestId("access-point-table");
    const headers = Array.from(table.querySelectorAll("th")).map((th) => th.textContent?.trim());
    expect(headers).toEqual(["Nombre", "Tipo", "Biometria", "LPR", "Congestion", "Acciones"]);
  });
});
