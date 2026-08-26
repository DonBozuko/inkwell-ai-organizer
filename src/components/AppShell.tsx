import { Link, useRouterState } from "@tanstack/react-router";
import { Inbox, LayoutList, Moon, Plus, Sun, Sparkles, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useCategories, useNotes } from "@/lib/notes";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Captura", icon: Inbox },
  { to: "/agenda", label: "Agenda", icon: LayoutList },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("agenda-theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        window.localStorage.setItem("agenda-theme", next ? "dark" : "light");
      }}
      className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

function CategoryList() {
  const { notes } = useNotes();
  const { categories, addCategory, removeCategory } = useCategories();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");

  return (
    <div className="space-y-1">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Categorias da IA
      </p>
      {categories.map((c) => (
        <div key={c.id} className="group/cat flex items-center">
          <Link
            to="/agenda"
            search={{ cat: c.id }}
            className="flex min-w-0 flex-1 items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="size-2 shrink-0 rounded-full bg-marker" />
              <span className="truncate">{c.label}</span>
            </span>
            <span className="shrink-0 text-xs tabular-nums">
              {notes.filter((n) => n.category === c.id).length}
            </span>
          </Link>
          {c.custom && (
            <button
              type="button"
              aria-label={`Remover pasta ${c.label}`}
              onClick={() => removeCategory(c.id)}
              className="ml-1 shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/cat:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <form
          className="px-3 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            addCategory(label);
            setLabel("");
            setAdding(false);
          }}
        >
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => setAdding(false)}
            placeholder="Nome da pasta"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-marker"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" /> Nova pasta
        </button>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-marker text-primary-foreground">
              <Sparkles className="size-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight">Agenda Inteligente</span>
              <span className="block truncate text-xs text-muted-foreground">por captura</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.to
                      ? "bg-marker-soft text-marker"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <CategoryList />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-xs font-medium transition-colors",
                  active ? "bg-marker-soft text-marker" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
