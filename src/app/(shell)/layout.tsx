import { TopNav } from "@/components/shell/top-nav";
import { LeftRail } from "@/components/shell/left-rail";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <LeftRail />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-surface-base p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
