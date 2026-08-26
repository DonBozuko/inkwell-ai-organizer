import { createFileRoute } from "@tanstack/react-router";
import { ClipboardPaste, Link2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ParagraphCapture } from "@/components/ParagraphCapture";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isUrl, toParagraphs } from "@/lib/notes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Captura Inteligente — Agenda por Captura" },
      {
        name: "description",
        content:
          "Cole um link ou um texto copiado e transforme cada parágrafo em nota organizada automaticamente pela IA.",
      },
      { property: "og:title", content: "Captura Inteligente — Agenda por Captura" },
      {
        property: "og:description",
        content: "Cole, toque no marcador azul e salve trechos em pastas inteligentes.",
      },
    ],
  }),
  component: CapturePage,
});

const SAMPLE = `A produtividade real não vem de fazer mais coisas, e sim de decidir melhor o que merece sua atenção hoje.

Ideia importante: capturar é diferente de organizar. Capture rápido, organize depois, em lotes curtos.

Tarefa: revisar o roteiro do projeto com a equipe até sexta e definir o prazo de entrega do cliente.

Estudo: o conceito de carga cognitiva mostra que a memória de trabalho comporta poucos itens por vez.`;

function CapturePage() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<{ paragraphs: string[]; source: string } | null>(null);

  const process = async () => {
    const value = raw.trim();
    if (!value) {
      toast.error("Cole um link ou um bloco de texto primeiro.");
      return;
    }

    if (isUrl(value)) {
      setLoading(true);
      try {
        const res = await fetch(`https://r.jina.ai/${value}`);
        if (!res.ok) throw new Error("fetch failed");
        const text = await res.text();
        const paragraphs = toParagraphs(text).filter((p) => p.length > 40).slice(0, 40);
        if (!paragraphs.length) throw new Error("empty");
        setContent({ paragraphs, source: value });
        toast.success("Link lido e formatado!");
      } catch {
        toast.error("Não consegui ler esse link. Cole o texto manualmente.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setContent({ paragraphs: toParagraphs(value), source: "Texto colado" });
    toast.success("Texto formatado. Toque no marcador azul para capturar.");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="surface rise-in p-5 sm:p-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Feed Inteligente</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Cole um link (URL) ou um bloco de texto copiado — uma resposta do ChatGPT, um artigo, uma anotação.
          </p>

          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="https://exemplo.com/artigo  ou  cole aqui o texto copiado…"
            className="mt-4 min-h-32 resize-y rounded-2xl text-base leading-relaxed"
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="h-12 flex-1 gap-2" onClick={process} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Processar conteúdo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2"
              onClick={async () => {
                try {
                  setRaw(await navigator.clipboard.readText());
                  toast.success("Conteúdo colado da área de transferência.");
                } catch {
                  toast.error("Permissão de colagem negada.");
                }
              }}
            >
              <ClipboardPaste className="size-4" />
              Colar
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12"
              onClick={() => {
                setRaw(SAMPLE);
                setContent({ paragraphs: toParagraphs(SAMPLE), source: "Exemplo" });
              }}
            >
              Ver exemplo
            </Button>
          </div>
        </section>

        {content && (
          <section className="surface p-4 sm:p-8">
            <div className="mb-5 flex min-w-0 items-center gap-2 border-b border-border pb-4 text-xs text-muted-foreground">
              <Link2 className="size-4 shrink-0" />
              <span className="truncate">{content.source}</span>
            </div>
            <div className="space-y-1.5">
              {content.paragraphs.map((p, i) => (
                <ParagraphCapture key={i} index={i} text={p} source={content.source} />
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Passe o mouse ou toque em um parágrafo e clique no marcador azul para capturar.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
