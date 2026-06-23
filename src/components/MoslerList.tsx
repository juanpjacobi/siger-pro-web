import { MoslerEntry } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";

interface MoslerListProps {
  entries: MoslerEntry[];
  onEdit: (entry: MoslerEntry) => void;
  onDelete: (entry: MoslerEntry) => void;
}

export function MoslerList({ entries, onEdit, onDelete }: MoslerListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        Todavia no hay entradas Mosler. Cargar la primera.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden" data-testid="mosler-cards">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{entry.amenaza === "Otra" ? entry.amenazaOtra : entry.amenaza}</p>
                <p className="text-sm text-gray-500">{entry.sector}</p>
              </div>
              <RiskBadge nivel={entry.nivel} />
            </div>
            <p className="mt-2 text-sm text-gray-700">EV: {entry.ev}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => onEdit(entry)} className="flex-1 rounded border border-gray-300 py-2 text-sm">
                Editar
              </button>
              <button
                onClick={() => onDelete(entry)}
                className="flex-1 rounded border border-red-300 py-2 text-sm text-red-700"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <table className="hidden w-full text-left text-sm md:table" data-testid="mosler-table">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2">Amenaza</th>
            <th className="py-2">Sector</th>
            <th className="py-2">EV</th>
            <th className="py-2">Nivel</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-100">
              <td className="py-2">{entry.amenaza === "Otra" ? entry.amenazaOtra : entry.amenaza}</td>
              <td className="py-2">{entry.sector}</td>
              <td className="py-2">{entry.ev}</td>
              <td className="py-2">
                <RiskBadge nivel={entry.nivel} />
              </td>
              <td className="py-2">
                <button onClick={() => onEdit(entry)} className="mr-2 text-blue-600">
                  Editar
                </button>
                <button onClick={() => onDelete(entry)} className="text-red-600">
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
