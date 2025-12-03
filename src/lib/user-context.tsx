"use client";

import { User } from "@/app/generated/prisma/client";
import { createContext, useContext, ReactNode } from "react";

interface UserContextType {
  role: User["role"];
  name: User["name"];
  email: User["email"];
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({
  children,
  userData,
}: {
  children: ReactNode;
  userData: UserContextType;
}) {
  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserRole must be used within UserProvider");
  }
  return context;
}
