import type { UserRole } from "@/app/generated/prisma/enums";
import { UserButton } from "@clerk/nextjs";

interface HeaderProps {
  user: {
    role: UserRole;
    name: string | null;
    email: string;
  };
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  ASESOR: "Asesor",
  MECANICO: "Mecánico",
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{roleLabels[user.role]}</p>
        </div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
            },
          }}
        />
      </div>
    </header>
  );
}
