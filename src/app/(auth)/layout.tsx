export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
