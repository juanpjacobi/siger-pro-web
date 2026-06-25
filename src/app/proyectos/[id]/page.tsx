"use client";

import { Clock, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

const MODULES = [
  {
    label: "Matriz Mosler",
    suffix: "/mosler",
    icon: Grid3x3,
    description: "Evaluacion de riesgo por amenaza (F·S + P·E) × (A·V)",
  },
  {
    label: "Tiempos Adversario",
    suffix: "/tiempos",
    icon: Clock,
    description: "Comparacion de tiempos de adversario vs. sistema de respuesta",
  },
];

export default function ProyectoResumenPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MODULES.map((mod) => (
        <Link key={mod.label} href={`/proyectos/${projectId}${mod.suffix}`}>
          <Card className="transition-colors hover:border-primary/50">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <mod.icon className="size-4" />
              </div>
              <div>
                <p className="font-medium leading-none">{mod.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
