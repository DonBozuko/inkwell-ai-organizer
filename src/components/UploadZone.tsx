import { FileUp, FolderUp, ImageUp, Loader2 } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { extractFile, type ExtractedFile } from "@/lib/files";
import { cn } from "@/lib/utils";

export type FeedItem = { text: string; attachment?: ExtractedFile["attachment"]; file?: File };

export function UploadZone({
  onContent,
}: {
  onContent: (items: FeedItem[], source: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const handleFiles = async (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    setBusy(true);
    const items: FeedItem[] = [];
    const failures: string[] = [];

    for (const file of files.slice(0, 25)) {
      try {
        const result = await extractFile(file);
        if (result.attachment?.kind === "image") {
          items.push({ text: "", attachment: result.attachment, file });
        } else {
          result.paragraphs.forEach((p, i) =>
            items.push(i === 0 && result.attachment ? { text: p, attachment: result.attachment, file } : { text: p }),
          );
        }
      } catch (err) {
        failures.push(err instanceof Error ? err.message : file.name);
      }
    }

    setBusy(false);
    if (failures.length) toast.error(failures[0] as string);
    if (!items.length) return;

    const source =
      files.length === 1 ? (files[0] as File).name : `${files.length} arquivos enviados`;
    onContent(items, source);
    toast.success("Arquivos processados!", {
      description: `${items.length} trecho(s) prontos para capturar.`,
    });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    void handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
        over ? "border-marker bg-marker-soft" : "border-border",
      )}
    >
      <p className="text-sm font-medium">Arraste arquivos aqui</p>
      <p className="mt-1 text-xs text-muted-foreground">
        PDF, imagens (JPG/PNG), TXT, MD, CSV, JSON, HTML — ou uma pasta inteira.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button variant="outline" size="lg" className="h-12 gap-2" disabled={busy} onClick={() => fileInput.current?.click()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          Arquivos
        </Button>
        <Button variant="outline" size="lg" className="h-12 gap-2" disabled={busy} onClick={() => imageInput.current?.click()}>
          <ImageUp className="size-4" />
          Imagens
        </Button>
        <Button variant="outline" size="lg" className="h-12 gap-2" disabled={busy} onClick={() => folderInput.current?.click()}>
          <FolderUp className="size-4" />
          Pasta
        </Button>
      </div>

      <input
        ref={fileInput}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.csv,.json,.html,.xml,.yml,.yaml,image/*"
        className="hidden"
        onChange={onChange}
      />
      <input ref={imageInput} type="file" multiple accept="image/*" className="hidden" onChange={onChange} />
      <input
        ref={folderInput}
        type="file"
        multiple
        className="hidden"
        onChange={onChange}
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
      />
    </div>
  );
}
