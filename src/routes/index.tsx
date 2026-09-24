import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardPaste, Link2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { FeatureGrid } from "@/components/FeatureGrid";
import { ParagraphCapture } from "@/components/ParagraphCapture";
import { UploadZone, type FeedItem } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { readUrl } from "@/lib/reader.functions";
import { SAMPLE_TEXT, featureById, type Feature } from "@/lib/features";
import { handleSharedFeature } from "@/lib/feature-actions";
import { isUrl, normalizeUrl, toParagraphs, useNotes } from "@/lib/notes";

type Search = { action?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["action"] === "string" ? { action: search["action"] } : {},
  head: () => ({
    meta: [
      { title: "Captura Inteligente — Agenda por Captura" },
      {
        name: "description",
        content:
          "Cole um link, texto, PDF ou imagem e transforme cada trecho em nota organizada automaticamente pela IA.",
      },
      { property: "og:title", content: "Captura Inteligente — Agenda por Captura" },
      {
        property: "og:description",
        content: "Cole, envie arquivos e salve trechos em pastas inteligentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CapturePage,
});

const SAMPLE = SAMPLE_TEXT;

function CapturePage() {
  const { action } = Route.useSearch();
  const navigate = useNavigate();
  const { notes } = useNotes();
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<{ items: FeedItem[]; source: string } | null>(null);
  const fetchUrl = useServerFn(readUrl);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const openUpload = useRef<(() => void) | null>(null);

  const setText = (text: string, source: string) =>
    setContent({ items: toParagraphs(text).map((t) => ({ text: t })), source });

  const focusField = () => {
    const field = textareaRef.current;
    if (!field) return;
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) throw new Error("empty");
      setRaw(text);
      setTimeout(focusField, 0);
      toast.success("Conteúdo colado da área de transferência.");
    } catch {
      setTimeout(focusField, 0);
      toast.info("Cole diretamente no campo de texto.", {
        description: "No celular, toque e segure dentro do campo e escolha Colar. No PC, use Ctrl+V.",
      });
    }
  };

  const runFeature = (feature: Feature) => {
    switch (feature.action) {
      case "prefill":
        setRaw(feature.template ?? "");
        setTimeout(focusField, 0);
        toast.success(`${feature.title}: escreva e toque em Processar conteúdo.`);
        return;
      case "clipboard":
        void pasteFromClipboard();
        return;
      case "upload":
        openUpload.current?.();
        return;
      case "sample":
        setRaw(SAMPLE);
        setText(SAMPLE, "Exemplo");
        setTimeout(focusField, 0);
        return;
      default:
        handleSharedFeature(feature, notes, () => {
          void navigate({ to: "/agenda", search: { cat: "todas" } });
        });
    }
  };

  useEffect(() => {
    if (!action) return;
    const feature = featureById(action);
    void navigate({ to: "/", search: {}, replace: true });
    if (feature) runFeature(feature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  const process = async () => {
    const value = raw.trim();
    if (!value) {
      toast.error("Cole um link ou um bloco de texto primeiro.");
      return;
    }

    if (isUrl(value)) {
      const url = normalizeUrl(value);
      setLoading(true);
      try {
        const { text } = await fetchUrl({ data: { url } });
        const paragraphs = toParagraphs(text).filter((p) => p.length > 40).slice(0, 60);
        if (!paragraphs.length) throw new Error("empty");
        setContent({ items: paragraphs.map((t) => ({ text: t })), source: url });
        toast.success("Link lido e formatado!");
      } catch {
        toast.error("Não consegui ler esse link.", {
          description: "Alguns sites bloqueiam leitura. Cole o texto manualmente ou envie o PDF.",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    setText(value, "Texto colado");
    toast.success("Texto formatado. Toque no marcador azul para capturar.");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="surface rise-in p-5 sm:p-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-orange-500">Feed Inteligente</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Cole um link, um texto copiado — ou envie PDFs, imagens e pastas inteiras.
          </p>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Melhores funções
            </p>
            <FeatureGrid onSelect={runFeature} />
          </div>

          <Textarea
            ref={textareaRef}
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
            <Button size="lg" variant="outline" className="h-12 gap-2" onClick={() => void pasteFromClipboard()}>
              <ClipboardPaste className="size-4" />
              Colar
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12"
              onClick={() => {
                setRaw(SAMPLE);
                setText(SAMPLE, "Exemplo");
              }}
            >
              Ver exemplo
            </Button>
          </div>

          <div className="mt-5">
            <UploadZone
              openRef={openUpload}
              onContent={(items, source) => setContent({ items, source })}
            />
          </div>
        </section>

        {content && (
          <section className="surface p-4 sm:p-8">
            <div className="mb-5 flex min-w-0 items-center gap-2 border-b border-border pb-4 text-xs text-muted-foreground">
              <Link2 className="size-4 shrink-0" />
              <span className="truncate">{content.source}</span>
            </div>
            <div className="space-y-1.5">
              {content.items.map((item, i) => (
                <ParagraphCapture
                  key={i}
                  index={i}
                  text={item.text}
                  source={content.source}
                  {...(item.attachment ? { attachment: item.attachment } : {})}
                  {...(item.file ? { file: item.file } : {})}
                />
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Passe o mouse ou toque em um item e clique no marcador azul para capturar.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
