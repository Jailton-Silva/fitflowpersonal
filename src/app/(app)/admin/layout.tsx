
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This layout is intentionally the same as the main AppLayout.
  // We keep it separate for future admin-specific layout customizations
  // and to apply different middleware logic based on the route structure.
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
            {children}
        </main>
      </div>
    </div>
  );
}
