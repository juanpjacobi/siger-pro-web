"use client";

import {
  AlertTriangle,
  Bot,
  Building2,
  Camera,
  CheckSquare,
  CircleDot,
  Clock,
  DoorOpen,
  FileText,
  Fence,
  Footprints,
  Gauge,
  Grid3x3,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Settings,
  ShieldAlert,
  Sparkles,
  Trees,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProject } from "@/lib/api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Modulos cuyo link depende de tener un proyecto seleccionado (toman el id de la URL actual).
// Si no hay proyecto activo, quedan deshabilitados en vez de apuntar a una ruta sin contexto.
function buildNavGroups(projectId: string | null): NavGroup[] {
  const projectScoped = (suffix: string) => (projectId ? `/proyectos/${projectId}${suffix}` : undefined);

  return [
    {
      label: "General",
      items: [
        { label: "Proyectos", href: "/proyectos", icon: Building2 },
        { label: "Marco Teorico", href: projectScoped("/metodologia"), icon: FileText },
        { label: "Configuracion", icon: Settings },
      ],
    },
    {
      label: "Relevamiento",
      items: [
        { label: "Datos Generales", icon: Building2 },
        { label: "Activos Protegidos", href: projectScoped("/activos"), icon: ShieldAlert },
        { label: "Entorno", icon: Trees },
        { label: "CPTED", icon: Lightbulb },
        { label: "Perimetro", href: projectScoped("/perimetro"), icon: Grid3x3 },
        { label: "Cercos / Sensores", icon: Fence },
        { label: "Iluminacion", icon: Lightbulb },
        { label: "Control de Accesos", icon: DoorOpen },
        { label: "Monitoreo / CCTV", icon: Camera },
        { label: "Personal de Seguridad", icon: Users },
        { label: "Rondines", icon: Footprints },
        { label: "Protocolos", icon: ListChecks },
        { label: "Incidentes", icon: AlertTriangle },
        { label: "Evidencias", icon: ImageIcon },
      ],
    },
    {
      label: "Analisis",
      items: [
        { label: "Evaluacion SPF", icon: Gauge },
        { label: "Matriz de Vulnerabilidades", icon: ShieldAlert },
        { label: "Matriz Mosler", href: projectScoped("/mosler"), icon: Grid3x3 },
        { label: "Tiempos Adversario", href: projectScoped("/tiempos"), icon: Clock },
        { label: "Circulos de Seguridad", icon: CircleDot },
        { label: "Analisis IA", icon: Bot },
      ],
    },
    {
      label: "Resultados",
      items: [
        { label: "Plan de Mejoras", icon: Wrench },
        { label: "Inversion", icon: Wallet },
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "Informe Tecnico", icon: FileText },
        { label: "Checklist de Calidad", icon: CheckSquare },
      ],
    },
  ];
}

export function AppSidebar() {
  const pathname = usePathname();
  const projectIdMatch = pathname?.match(/^\/proyectos\/([^/]+)(?:\/|$)/);
  const projectId = projectIdMatch && projectIdMatch[1] !== "nuevo" ? projectIdMatch[1] : null;
  const { data: activeProject } = useProject(projectId ?? "");
  const navGroups = buildNavGroups(projectId);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">SIGER-PRO</span>
            <span className="text-xs text-muted-foreground">Gestion de Riesgos</span>
          </div>
        </div>
        {projectId && (
          <div className="flex items-center justify-between gap-2 rounded-md bg-accent/50 px-2 py-1.5">
            <span className="truncate text-xs font-medium">{activeProject?.nombre ?? "Cargando..."}</span>
            <Link href="/proyectos" className="shrink-0 text-xs text-muted-foreground hover:text-foreground">
              Cambiar
            </Link>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    !!item.href && (pathname === item.href || pathname?.startsWith(`${item.href}/`));
                  const button = item.href ? (
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton disabled className="opacity-50">
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  );
                  return <SidebarMenuItem key={item.label}>{button}</SidebarMenuItem>;
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
