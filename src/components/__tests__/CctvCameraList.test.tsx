import { render, screen } from "@testing-library/react";
import { CctvCameraList } from "@/components/CctvCameraList";
import { CctvCameraEntry } from "@/lib/api";

function buildEntry(overrides: Partial<CctvCameraEntry> = {}): CctvCameraEntry {
  return {
    id: "uuid-1",
    projectId: "p1",
    camId: "CAM-01",
    nombre: "Camara Principal",
    sector: "Sector Norte",
    ubicacion: "Entrada principal",
    tipo: "Domo",
    marca: "Hikvision",
    resolucion: "4MP",
    alcance: 30,
    nocturna: true,
    ir: true,
    cruceLinea: false,
    intrusion: false,
    merodeo: false,
    movimiento: false,
    facial: false,
    patente: false,
    estado: "Optimo",
    suciedad: false,
    desenfoque: false,
    obstruccion: false,
    antivandalica: true,
    energia: "Estable",
    conectividad: "Estable",
    grabacion: "24/7",
    retencion: 30,
    alerta: false,
    obsCCTV: null,
    criticidad: "Alta",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("CctvCameraList", () => {
  // Criterio 9: renderiza fila/card por entrada en el mismo orden que llegan (sin reordenar)
  it("renderiza una fila/card por entrada en el mismo orden en que llegan (sin reordenar)", () => {
    const entries = [
      buildEntry({ id: "uuid-z", camId: "CAM-Z", nombre: "Camara Z" }),
      buildEntry({ id: "uuid-a", camId: "CAM-A", nombre: "Camara A" }),
    ];
    render(<CctvCameraList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const camIds = screen.getAllByText(/^CAM-[ZA]$/);
    expect(camIds[0]).toHaveTextContent("CAM-Z");
    expect(camIds[1]).toHaveTextContent("CAM-A");
  });

  // Criterio 10: muestra estado vacío con CTA cuando lista es []
  it("muestra estado vacio con CTA cuando la lista es [], sin mostrarlo como error", () => {
    render(<CctvCameraList entries={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/todavía no hay cámaras cargadas/i)).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // Criterio 11: muestra CriticalityBadge con valor correcto y fallback para null/undefined
  it("muestra CriticalityBadge correcto para Baja, Media, Alta, Critica y fallback Sin dato para null", () => {
    const entries = [
      buildEntry({ id: "uuid-1", camId: "CAM-01", criticidad: "Baja" }),
      buildEntry({ id: "uuid-2", camId: "CAM-02", criticidad: "Media" }),
      buildEntry({ id: "uuid-3", camId: "CAM-03", criticidad: "Alta" }),
      buildEntry({ id: "uuid-4", camId: "CAM-04", criticidad: "Critica" }),
      buildEntry({ id: "uuid-5", camId: "CAM-05", criticidad: null }),
    ];
    render(<CctvCameraList entries={entries} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("Baja").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Media").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Critica").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sin dato/i).length).toBeGreaterThan(0);
  });

  // Criterio 12: muestra camId como identificador principal (no el uuid interno id)
  it("muestra camId como identificador principal (no el uuid interno id) en cards y tabla", () => {
    const entry = buildEntry({ id: "uuid-secreto", camId: "CAM-01" });
    render(<CctvCameraList entries={[entry]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getAllByText("CAM-01").length).toBeGreaterThan(0);
    expect(screen.queryByText("uuid-secreto")).not.toBeInTheDocument();
  });

  // Criterio 13: en viewport mobile, tabla ausente u oculta (clase hidden)
  it("usa clases mobile-first: cards con md:hidden, tabla con hidden md:block", () => {
    render(<CctvCameraList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByTestId("cctv-camera-cards").className).toContain("md:hidden");
    const table = screen.getByTestId("cctv-camera-table");
    expect(table.className).toContain("hidden");
    expect(table.className).toContain("md:block");
  });

  // Criterio 14: tabla desktop muestra exactamente las columnas ID/Nombre/Tipo/Estado/Grabación/Criticidad/Acciones
  it("la tabla desktop muestra exactamente las columnas ID/Nombre/Tipo/Estado/Grabacion/Criticidad/Acciones en ese orden", () => {
    render(<CctvCameraList entries={[buildEntry()]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    const table = screen.getByTestId("cctv-camera-table");
    const headers = Array.from(table.querySelectorAll("th")).map((th) => th.textContent?.trim());
    expect(headers).toEqual(["ID", "Nombre", "Tipo", "Estado", "Grabación", "Criticidad", "Acciones"]);
  });
});
