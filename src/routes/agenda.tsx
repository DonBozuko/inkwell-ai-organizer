import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  Download,
  FileText,
  Inbox,
  Link2,
  ListTodo,
  Paperclip,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState, type FC } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  categoryLabel,
  formatBytes,
  formatDate,
  noteToMarkdown,
  useCategories,
  useNotes,
  type CategoryId,
  type Note,
} from "@/lib/notes";
import { cn } from "@/lib/utils";

type Search = { cat: CategoryId | "todas" };

export const Route = createFileRoute("/agenda")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    cat: (search["cat"] as Search["cat"]) || "todas",
  }),
  head: () => ({
    meta: [
      { title: "Dashboard da Agenda — Notas capturadas" },
      {
        name: "description",
        content:
          "Todas as suas notas capturadas, organizadas em pastas inteligentes, com download e compartilhamento.",
      },
      { property: "og:title", content: "Dashboard da Agenda — Notas capturadas" },
      {
        property: "og:description",
        content: "Notas organizadas pela IA em Insights, Estudos, Trabalho e Tarefas.",
      },
    ],
  }),
  component: AgendaPage,
});

function download(note: Note) {
  try {
    const blob = new Blob([noteToMarkdown(note)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title
      .replace(/[^\p{L}\p{N} -]/gu, "")
      .slice(0, 48)
      .trim() || "nota"
    }.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download iniciado!", {
      description: "Arquivo .md salvo no dispositivo.",
    });
  } catch {
    toast.error("Não foi possível baixar a nota.");
  }
}

async function share(note: Note) {
  try {
    const text = noteToMarkdown(note);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: note.title, text });
        return;
      } catch {
        // usuário cancelou — cai para o clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success("Texto formatado copiado!", {
        description: "Cole onde quiser.",
      });
    } else {
      toast.error("Compartilhamento indisponível neste navegador.");
    }
  } catch {
    toast.error("Não foi possível compartilhar.");
  }
}

type NoteCardProps = {
  note: Note;
  onRemove: () => void;
};

const NoteCard: FC<NoteCardProps> = ({ note, onRemove }) => {
  const isImage =
    note.attachment?.kind === "image" &&
    typeof note.attachment.dataUrl === "string" &&
    note.attachment.dataUrl.length > 0;

  const isFile = note.attachment?.kind === "file";

  return (
    <article className="surface rise-in p-4 sm:p-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug tracking-tight sm:text-lg">
            {note.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {formatDate(note.createdAt)}
          </p>
        </div>
        <Badge className="shrink-0 border-0 bg-marker-soft text-marker">
          {categoryLabel(note.category)}
        </Badge>
      </header>

      {isImage && typeof note.attachment?.dataUrl === "string" && (
        <img
          src={note.attachment.dataUrl}
          alt={note.attachment.name ?? "Anexo de imagem"}
          className="mt-3 max-h-64 w-full rounded-xl object-cover"
          loading="lazy"
        />
      )}

      {note.text && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {note.text}
        </p>
      )}

      {isFile && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">
            {note.attachment?.name ?? "Anexo"} ·{" "}
            {formatBytes(note.attachment?.size ?? 0)}
          </span>
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link2 className="size-3.5 shrink-0" />
        <span className="truncate" title={note.source}>
          {note.source}
        </span>
      </p>

      <footer className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          size="lg"
          className="h-11 flex-1 gap-2"
          onClick={() => download(note)}
        >
          <Download className="size-4" />
          Download
        </Button>
        <Button
          size="lg"
          className="h-11 flex-1 gap-2"
          onClick={() => void share(note)}
        >
          <Share2 className="size-4" />
          Compartilhar
        </Button>
        <Button
          variant="ghost"
          size="lg"
          aria-label="Excluir nota"
          className="h-11 w-11 shrink-0 p-0 text-muted-foreground"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </footer>
    </article>
  );
};

type QuickDef = {
  readonly id: "hoje" | "anexo" | "tarefas";
  readonly label: string;
  readonly icon: FC<{ className?: string }>;
};

const QUICK: readonly QuickDef[] = [
  { id: "hoje", label: "Hoje", icon: Clock },
  { id: "anexo", label: "Com anexo", icon: Paperclip },
  { id: "tarefas", label: "Tarefas", icon: ListTodo },
] as const;

type QuickId = QuickDef["id"];
type CategoryIdOrAll = CategoryId | "todas";

const DAY_MS = 24 * 60 * 60 * 1000;

function AgendaPage() {
  const { cat } = Route.useSearch();
  const { notes, removeNote } = useNotes();
  const { categories } = useCategories();
  const [quick, setQuick] = useState<readonly QuickId[]>([]);

  const allCategories: ReadonlyArray<{
    id: CategoryIdOrAll;
    label: string;
  }> = [
    { id: "todas", label: "Todas" },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  const byCat =
    cat !== "todas" ? notes.filter((n) => n.category === cat) : notes;

  const filtered = byCat.filter((n) => {
    if (quick.includes("hoje") && Date.now() - n.createdAt > DAY_MS)
      return false;
    if (quick.includes("anexo") && !n.attachment) return false;
    if (quick.includes("tarefas") && n.category !== "tarefas") return false;
    return true;
  });

  const toggle = (id: QuickId) =>
    setQuick((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id],
    );

  const handleRemove = (noteId: string) => () => {
    try {
      void removeNote(noteId).catch(() => {
        toast.error("Não foi possível excluir a nota.");
      });
    } catch {
      toast.error("Não foi possível excluir a nota.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[#8B0000]">
            Agenda Inteligente
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {notes.length}{" "}
            {notes.length === 1 ? "nota capturada" : "notas capturadas"}
          </p>
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {allCategories.map((c) => (
            <Link
              key={c.id}
              to="/agenda"
              search={{ cat: c.id }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                cat === c.id
                  ? "border-marker bg-marker-soft text-marker"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {QUICK.map((q) => {
            const active = quick.includes(q.id);
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(q.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-marker bg-marker text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {q.label}
              </button>
            );
          })}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            <Sparkles className="size-4" />
            Capturar agora
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="surface flex flex-col items-center gap-3 p-10 text-center">
            <Inbox className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma nota aqui ainda.
            </p>
            <Button asChild size="lg" className="h-12">
              <Link to="/">Capturar conteúdo</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                onRemove={handleRemove(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};