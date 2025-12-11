"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/lib/user-context";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  FileText,
  ClipboardList,
  Receipt,
  Wrench,
  Calendar,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ASESOR", "MECANICO"],
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    label: "Clientes",
    href: "/customers",
    icon: Users,
    roles: ["ADMIN", "ASESOR"],
  },
  {
    label: "Repuestos",
    href: "/parts",
    icon: Package,
    roles: ["ADMIN", "ASESOR"],
  },
  {
    label: "Órdenes de Servicio",
    href: "/service-orders",
    icon: FileText,
    roles: ["ADMIN", "ASESOR", "MECANICO"],
  },
  {
    label: "Registrar Recepción",
    href: "/reception",
    icon: Wrench,
    roles: ["MECANICO"],
  },
  {
    label: "Registrar Revisión",
    href: "/revision",
    icon: ClipboardList,
    roles: ["MECANICO"],
  },
  {
    label: "Facturas",
    href: "/invoices",
    icon: Receipt,
    roles: ["ADMIN", "ASESOR"],
  },
  {
    label: "Citas",
    href: "/appointments",
    icon: Calendar,
    roles: ["ADMIN", "ASESOR"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, name } = useUserContext();

  // Filtrar los items del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter((item) => {
    return item.roles.includes(role);
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-orange-600">PESANORT</h2>
        <p className="text-sm text-gray-500 mt-1">Sistema de Gestión</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-orange-100 text-orange-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
