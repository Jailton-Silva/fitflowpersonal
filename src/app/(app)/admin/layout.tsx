
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This layout inherits the main AppLayout (Sidebar, Header).
  // We keep it separate for future admin-specific layout customizations
  // and to apply different middleware logic based on the route structure.
  // The main content area styling is adjusted here.
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
        {children}
    </main>
  );
}
