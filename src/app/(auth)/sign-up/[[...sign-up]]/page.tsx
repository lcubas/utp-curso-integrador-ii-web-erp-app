import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">PESANORT</h1>
        <p className="text-white/90 mt-2">Sistema de Gestión de Taller</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-orange-500 hover:bg-orange-600",
            card: "shadow-2xl",
          },
        }}
      />
    </div>
  );
}
