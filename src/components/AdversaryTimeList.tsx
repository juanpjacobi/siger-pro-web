import { AdversaryTimeEntry } from "@/lib/api";
import { TimeStatusBadge } from "./TimeStatusBadge";

interface AdversaryTimeListProps {
  entries: AdversaryTimeEntry[];
  onEdit: (entry: AdversaryTimeEntry) => void;
  onDelete: (entry: AdversaryTimeEntry) => void;
}

export function AdversaryTimeList({ entries, onEdit, onDelete }: AdversaryTimeListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        Todavia no hay escenarios de tiempos. Cargar el primero.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden" data-testid="adversary-time-cards">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{entry.amenaza}</p>
              <TimeStatusBadge estado={entry.estado} />
            </div>
            <p className="mt-2 text-sm text-gray-700">Delta: {entry.delta}</p>
            <p className="mt-1 text-sm text-gray-500">{entry.msg}</p>
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

      <table className="hidden w-full text-left text-sm md:table" data-testid="adversary-time-table">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2">Amenaza</th>
            <th className="py-2">Delta</th>
            <th className="py-2">Estado</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-100">
              <td className="py-2">{entry.amenaza}</td>
              <td className="py-2">{entry.delta}</td>
              <td className="py-2">
                <TimeStatusBadge estado={entry.estado} />
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
