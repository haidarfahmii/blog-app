export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/40 py-12">
      <div className="w-full max-w-md space-y-8 px-4">{children}</div>
    </div>
  );
}
