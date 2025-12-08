import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import prisma from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { UserProvider } from "@/lib/user-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();

  // Sincronizar usuario con base de datos
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser && clerkUser) {
    // Crear usuario en BD si no existe
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        role: "ASESOR", // Rol por defecto
      },
    });
  }

  if (!dbUser) {
    redirect("/sign-in");
  }

  const userData = {
    id: userId,
    role: dbUser.role,
    name: dbUser.name,
    email: dbUser.email,
  };

  return (
    <UserProvider userData={userData}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header user={dbUser} />
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
