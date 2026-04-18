import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListChecks,
  ShoppingCart,
  GitBranch,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", shortLabel: "Tasks", icon: ListChecks },
  { href: "/parts", label: "Parts List", shortLabel: "Parts", icon: ShoppingCart },
  { href: "/timeline", label: "Timeline & Costs", shortLabel: "Costs", icon: GitBranch },
  { href: "/knowledge", label: "Knowledge Base", shortLabel: "KB", icon: BookOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden" data-testid="app-layout">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-sidebar flex-col" data-testid="sidebar">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="R129 Tracker"
            >
              <rect width="36" height="36" rx="8" fill="hsl(var(--primary))" />
              <path
                d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10S8 23.523 8 18z"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="18" cy="18" r="3" fill="hsl(var(--primary-foreground))" />
              <path
                d="M18 11v4M18 21v4M11 18h4M21 18h4"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">R129 SL500</h1>
              <p className="text-xs text-muted-foreground">Restomod Tracker</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1" data-testid="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">1994 Mercedes-Benz</p>
          <p className="text-xs text-muted-foreground">SL500 (R129) · M119 V8</p>
        </div>
      </aside>

      {/* Mobile Header — visible only on mobile */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar shrink-0" data-testid="mobile-header">
        <svg
          width="28"
          height="28"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="R129 Tracker"
        >
          <rect width="36" height="36" rx="8" fill="hsl(var(--primary))" />
          <path
            d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10S8 23.523 8 18z"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="18" cy="18" r="3" fill="hsl(var(--primary-foreground))" />
          <path
            d="M18 11v4M18 21v4M11 18h4M21 18h4"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground">R129 SL500</h1>
          <p className="text-[11px] text-muted-foreground leading-tight">Restomod Tracker</p>
        </div>
      </header>

      {/* Main Content — padding-bottom on mobile for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0" data-testid="main-content">
        <div className="p-4 md:p-6 max-w-[1200px]">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-border flex items-center justify-around z-50 safe-area-bottom"
        data-testid="mobile-bottom-nav"
      >
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 px-1 min-w-[56px] transition-colors cursor-pointer",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                data-testid={`mobile-nav-${item.shortLabel.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight">{item.shortLabel}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
