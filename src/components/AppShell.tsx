import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutList, Moon, NotebookPen, Sparkles, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { isDarkTheme, applyTheme, toggleTheme, THEME_EVENT } from "@/lib/features";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Captura", icon: Sparkles },
  { to: "/agenda", label: "Agenda", icon: LayoutList },
  { to: "/funcoes", label: "Funções", icon: NotebookPen },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const initial = isDarkTheme();
    setDark(initial);
    applyTheme(initial);
    const listener = (e: Event) => setDark((e as CustomEvent<boolean>).detail);
    window.addEventListener(THEME_EVENT, listener);
    return () => window.removeEventListener(THEME_EVENT, listener);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      onClick={() => setDark(toggleTheme())}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#808080] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-xl bg-[#00FF66] text-black">
              <Sparkles className="size-4" />
            </span>
            Agenda Inteligente
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegação principal">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(item.to)
                    ? "bg-marker-soft text-marker"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:pb-10">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur sm:hidden"
        aria-label="Navegação inferior"
      >
        <div className="grid grid-cols-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive(item.to) ? "text-marker" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
