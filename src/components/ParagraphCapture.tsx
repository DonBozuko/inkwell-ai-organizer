import { Check, Sparkles, SlidersHorizontal, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  CATEGORIES,
  categoryLabel,
  suggestCategory,
  suggestTags,
  suggestTitle,
  useNotes,
  type CategoryId,
} from "@/lib/notes";
import { cn } from "@/lib/utils";

type MenuProps = {
  text: string;
  source: string;
  onSaved: () => void;
  close: () => void;
};

function CaptureForm({ text, source, onSaved, close }: MenuProps) {
  const { addNote } = useNotes();
  const [title, setTitle] = useState(() => suggestTitle(text));
  const [custom, setCustom] = useState(false);
  const [category, setCategory] = useState<CategoryId>(() => suggestCategory(text));
  const [tags, setTags] = useState(() => suggestTags(text).join(", "));

  const save = (cat: CategoryId) => {
    addNote({
      title: title.trim() || suggestTitle(text),
      text,
      category: cat,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      source,
    });
    toast.success(`Nota salva na pasta ${categoryLabel(cat)}!`, {
      description: title.trim() || suggestTitle(text),
    });
    onSaved();
    close();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5 text-marker" /> Título sugerido pela IA
        </label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-12 text-base" />
      </div>

      <p className="line-clamp-3 rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">{text}</p>

      {!custom ? (
        <div className="grid gap-2">
          <Button size="lg" className="h-12 w-full gap-2" onClick={() => save(suggestCategory(text))}>
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
              {CATEGORIES.map((c) => (
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
            <Input value={tags} onChange={(e) => setTags(e.target.value)} className="h-12 text-base" />
          </div>
          <Button size="lg" className="h-12 w-full" onClick={() => save(category)}>
            Salvar na agenda
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
}: {
  text: string;
  source: string;
  index: number;
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
              <CaptureForm
                text={text}
                source={source}
                onSaved={() => setSaved(true)}
                close={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{marker}</PopoverTrigger>
          <PopoverContent align="start" side="right" className="w-80 p-4">
            <CaptureForm
              text={text}
              source={source}
              onSaved={() => setSaved(true)}
              close={() => setOpen(false)}
            />
          </PopoverContent>
        </Popover>
      )}

      <p
        onClick={() => setOpen(true)}
        className={cn(
          "cursor-pointer rounded-xl px-3 py-2.5 text-[15px] leading-relaxed transition-colors sm:text-base",
          "hover:bg-marker-soft",
          saved && "bg-marker-soft/60",
        )}
      >
        {text}
      </p>
    </div>
  );
}
