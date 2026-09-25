import { Check, FileText, Sparkles, SlidersHorizontal, Wand2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  categoryLabel,
  formatBytes,
  suggestCategory,
  suggestTags,
  suggestTitle,
  useCategories,
  useNotes,
  type Attachment,
  type CategoryId,
} from "@/lib/notes";
import { cn } from "@/lib/utils";

function sanitize(input: string): string {
  return input.replace(/<[^>]*>?/g, "");
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

type MenuProps = {
  text: string;
  source: string;
  attachment?: Attachment;
  file?: File;
  onSaved: () => void;
  close: () => void;
};

function defaultTitle(text: string, attachment?: Attachment) {
  if (text.trim()) return suggestTitle(text);
  return attachment?.name.replace(/\.[^.]+$/, "") ?? "Nova nota";
}

function CaptureForm({ text, source, attachment, file, onSaved, close }: MenuProps) {
  const { addNote } = useNotes();
  const { categories } = useCategories();
  const [title, setTitle] = useState(() => defaultTitle(text, attachment));
  const [custom, setCustom] = useState(false);
  const [category, setCategory] = useState<CategoryId>(() => suggestCategory(text));
  const [tags, setTags] = useState(() => suggestTags(text).join(", "));
  const [saving, setSaving] = useState(false);

  const save = async (cat: CategoryId) => {
    setSaving(true);
    try {
      const trimmedTitle = sanitize(title.trim() || defaultTitle(text, attachment));
      if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
      throw new Error("O título deve ter entre 3 e 100 caracteres.");
      }
      const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
      if (tagsArray.length > 10) {
      throw new Error("Máximo de 10 tags permitidos.");
      }
      const sanitizedText = sanitize(text);
      // Validate URLs in text
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const processedText = sanitizedText.replace(urlRegex, (match) => (isValidUrl(match) ? match : ""));
      await addNote({
        title: trimmedTitle,
        text: processedText,
        category: cat,
        tags: tagsArray,
        source,
        ...(attachment ? { attachment } : {}),
      }, file);
      toast.success(`Nota salva na pasta ${categoryLabel(cat)}!`, {
        description: sanitizedTitle,
      });
      onSaved();
      close();
    } catch (error) {
      toast.error("Não foi possível salvar a nota.", {
      description: error instanceof Error ? error.message : "Verifique o espaço disponível no dispositivo ou tente novamente mais tarde.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5 text-marker" /> Título sugerido pela IA
        </label>
        <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-12 text-base"
        placeholder="Título da nota"
        aria-label="Título"
        />
      </div>

      {attachment?.kind === "image" && attachment.dataUrl && (
        <img
          src={attachment.dataUrl}
          alt={attachment.name}
          className="max-h-48 w-full rounded-xl object-cover"
        />
      )}

      {text && <p className="line-clamp-3 rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">{text}</p>}

      {!custom ? (
        <div className="grid gap-2">
          <Button size="lg" className="h-12 w-full gap-2" disabled={saving} onClick={() => void save(suggestCategory(text))}>
            <Wand2 className="size-4" />
            Organização Automática
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full gap-2"
            onClick={() => setCustom(true)}
          >
            <SlidersHorizontal className="size-4" />
            Personalizar
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Sugestão automática: <span className="text-marker">{categoryLabel(suggestCategory(text))}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pasta</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                    category === c.id
                      ? "border-marker bg-marker-soft text-marker"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  <span className="truncate">{c.label}</span>
                  {category === c.id && <Check className="size-4 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tags (separadas por vírgula)
            </p>
            <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="h-12 text-base"
            placeholder="Ex.: tecnologia, saúde"
            aria-label="Tags"
            />
          </div>
          <Button size="lg" className="h-12 w-full" disabled={saving} onClick={() => void save(category)}>
          {saving ? (
          <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando…
          </>
          ) : (
          "Salvar na agenda"
          )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ParagraphCapture({
  text,
  source,
  index,
  attachment,
  file,
}: {
  text: string;
  source: string;
  index: number;
  attachment?: Attachment;
  file?: File;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const marker = (
    <button
      type="button"
      aria-label="Capturar este trecho"
      onClick={() => setOpen(true)}
      className={cn(
        "absolute -left-1 top-1.5 grid size-8 -translate-x-full place-items-center rounded-lg transition-all sm:top-2",
        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100",
        open && "opacity-100",
      )}
    >
      <span
        className={cn(
          "size-3 rounded-full transition-transform",
          saved ? "bg-marker ring-4 ring-marker-soft" : "bg-marker/70 hover:scale-125",
        )}
      />
    </button>
  );

  const form = (
    <CaptureForm
      text={text}
      source={source}
      {...(attachment ? { attachment } : {})}
      {...(file ? { file } : {})}
      onSaved={() => setSaved(true)}
      close={() => setOpen(false)}
    />
  );

  return (
    <div
      className="group relative rise-in pl-8 sm:pl-10"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      {isMobile ? (
        <>
          {marker}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-5">
              <SheetHeader className="px-0 pb-2">
                <SheetTitle>Capturar trecho</SheetTitle>
              </SheetHeader>
              {form}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{marker}</PopoverTrigger>
          <PopoverContent align="start" side="right" className="w-80 p-4">
            {form}
          </PopoverContent>
        </Popover>
      )}

      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Abrir captura"
        className={cn(
          "cursor-pointer rounded-xl px-3 py-2.5 transition-colors",
          "hover:bg-marker-soft",
          saved && "bg-marker-soft/60",
        )}
      >
        {attachment?.kind === "image" && attachment.dataUrl && (
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="mb-2 max-h-72 w-full rounded-xl object-contain"
          />
        )}
        {text ? (
          <p className="text-[15px] leading-relaxed sm:text-base">{text}</p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4" />
            {attachment?.name} {attachment ? `· ${formatBytes(attachment.size)}` : null}
          </p>
        )}
      </div>
    </div>
  );
}
