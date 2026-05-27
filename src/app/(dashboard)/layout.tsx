import { Sidebar, MobileBottomNav } from "@/components/dashboard/Sidebar";
import { getCurrentUserRole } from "@/server/dashboard/team";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getCurrentUserRole();

  return (
    <div className="min-h-screen bg-bloom-ink text-bloom-cream">
      <Sidebar role={role} />
      <main
        id="main-content"
        className="lg:ml-64 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 pb-24 lg:pb-12"
      >
        {children}
      </main>
      <MobileBottomNav role={role} />
    </div>
  );
}
