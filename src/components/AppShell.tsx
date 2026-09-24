import { Link, useRouterState } from "@tanstack/react-router";
import { Inbox, LayoutList, Moon, Plus, Sun, Wand2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { THEME_EVENT, isDarkTheme, applyTheme } from "@/lib/features";
import { useCategories, useNotes } from "@/lib/notes";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { ErrorBoundary } from "react-error-boundary";

const NAV = [
  { to: "/", label: "Captura", icon: Inbox },
  { to: "/agenda", label: "Agenda", icon: LayoutList },
  { to: "/funcoes", label: "Funções", icon: Wand2 },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = isDarkTheme();
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    const onChange = (event: Event) => setDark((event as CustomEvent<boolean>).detail);
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={() => applyTheme(!dark)}
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
  const noteCounts = new Map<string, number>();

  for (const note of notes) {
    noteCounts.set(note.category, (noteCounts.get(note.category) ?? 0) + 1);
  }

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
            <span className="shrink-0 text-xs tabular-nums">{noteCounts.get(c.id) ?? 0}</span>
          </Link>
          {c.custom && (
            <button
              type="button"
              aria-label={`Remover pasta ${c.label}`}
              onClick={() =>
                void removeCategory(c.id).catch(() => toast.error("Não foi possível remover a pasta."))
              }
              className="ml-1 shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/cat:opacity-100"
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
            void addCategory(label).catch((error) =>
              toast.error("Não foi possível criar a pasta.", {
                description: error instanceof Error ? error.message : undefined,
              }),
            );
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
            className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-marker"
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
    <div className="min-h-screen text-foreground">
    <Helmet>
      <title>Agenda - Por captura</title>
      <meta name="description" content="Gerencie suas notas e agenda de forma eficiente." />
      <meta property="og:image" content="/og-image.png" />
    </Helmet>
    <header className="fixed top-0 left-0 right-0 z-30 w-full border-b border-border/70 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight">Agenda</span>
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

      <div className="mx-auto flex flex-col lg:flex-row max-w-6xl gap-8 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <CategoryList />
          </div>
        </aside>
        <main className="min-w-0 flex-1" aria-label="Conteúdo principal">
          <ErrorBoundary
            fallback={
              <div className="p-4 text-center text-red-600">
                Ocorreu um erro inesperado. Por favor, recarregue a página.
              </div>
            }
          >
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border backdrop-blur-xl lg:hidden">
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
