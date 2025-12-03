import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Package,
  FileText,
  Wrench,
  Receipt,
  Calendar,
} from "lucide-react";
import type { UserRole } from "../../app/generated/prisma/enums";

interface SidebarProps {
  user: {
    role: UserRole;
    name: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "ASESOR", "MECANICO"],
    },
    {
      label: "Gestión de Usuarios",
      href: "/dashboard/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      label: "Gestión de Clientes",
      href: "/dashboard/customers",
      icon: UserCircle,
      roles: ["ADMIN", "ASESOR"],
    },
    {
      label: "Gestión de Repuestos",
      href: "/dashboard/parts",
      icon: Package,
      roles: ["ADMIN", "ASESOR"],
    },
    {
      label: "Órdenes de Servicio",
      href: "/dashboard/service-orders",
      icon: FileText,
      roles: ["ADMIN", "ASESOR", "MECANICO"],
    },
    {
      label: "Recepción",
      href: "/dashboard/reception",
      icon: Wrench,
      roles: ["MECANICO"],
    },
    {
      label: "Facturas",
      href: "/dashboard/invoices",
      icon: Receipt,
      roles: ["ADMIN", "ASESOR"],
    },
    {
      label: "Citas",
      href: "/dashboard/appointments",
      icon: Calendar,
      roles: ["ADMIN", "ASESOR"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user.role),
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-orange-500">PESANORT</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
