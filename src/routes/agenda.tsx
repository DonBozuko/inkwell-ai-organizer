import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Download, Inbox, Link2, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  categoryLabel,
  formatDate,
  noteToMarkdown,
  useNotes,
  type CategoryId,
  type Note,
} from "@/lib/notes";
import { cn } from "@/lib/utils";

type Search = { cat?: CategoryId | "todas" };

export const Route = createFileRoute("/agenda")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    cat: (search["cat"] as Search["cat"]) ?? "todas",
  }),
  head: () => ({
    meta: [
      { title: "Dashboard da Agenda — Notas capturadas" },
      {
        name: "description",
        content: "Todas as suas notas capturadas, organizadas em pastas inteligentes, com download e compartilhamento.",
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
  const blob = new Blob([noteToMarkdown(note)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^\p{L}\p{N} -]/gu, "").slice(0, 48).trim() || "nota"}.md`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Download iniciado!", { description: "Arquivo .md salvo no dispositivo." });
}

async function share(note: Note) {
  const text = noteToMarkdown(note);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: note.title, text });
      return;
    } catch {
      /* usuário cancelou — cai para o clipboard */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Texto formatado copiado!", { description: "Cole onde quiser." });
  } catch {
    toast.error("Não foi possível compartilhar.");
  }
}

function NoteCard({ note, onRemove }: { note: Note; onRemove: () => void }) {
  return (
    <article className="surface rise-in p-4 sm:p-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug tracking-tight sm:text-lg">{note.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {formatDate(note.createdAt)}
          </p>
        </div>
        <Badge className="shrink-0 border-0 bg-marker-soft text-marker">{categoryLabel(note.category)}</Badge>
      </header>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{note.text}</p>

      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
        <Link2 className="size-3.5 shrink-0" />
        <span className="truncate">{note.source}</span>
      </p>

      <footer className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="outline" size="lg" className="h-11 flex-1 gap-2" onClick={() => download(note)}>
          <Download className="size-4" />
          Download
        </Button>
        <Button size="lg" className="h-11 flex-1 gap-2" onClick={() => share(note)}>
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
}

function AgendaPage() {
  const { cat } = Route.useSearch();
  const { notes, removeNote } = useNotes();
  const filtered = cat && cat !== "todas" ? notes.filter((n) => n.category === cat) : notes;

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Dashboard da Agenda</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {notes.length} {notes.length === 1 ? "nota capturada" : "notas capturadas"}
          </p>
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {[{ id: "todas", label: "Todas" }, ...CATEGORIES].map((c) => (
            <Link
              key={c.id}
              to="/agenda"
              search={{ cat: c.id as Search["cat"] }}
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

        {filtered.length === 0 ? (
          <div className="surface flex flex-col items-center gap-3 p-10 text-center">
            <Inbox className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma nota aqui ainda.</p>
            <Button asChild size="lg" className="h-12">
              <Link to="/">Capturar conteúdo</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((n) => (
              <NoteCard key={n.id} note={n} onRemove={() => removeNote(n.id)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
