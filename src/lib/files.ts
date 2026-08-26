import type { Attachment } from "@/lib/notes";

export type ExtractedFile = {
  name: string;
  source: string;
  paragraphs: string[];
  attachment?: Attachment;
};

const TEXT_EXT = /\.(txt|md|markdown|csv|json|log|html?|xml|yml|yaml|srt|rtf)$/i;

async function readAsText(file: File) {
  return await file.text();
}

async function readAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read error"));
    reader.readAsDataURL(file);
  });
}

/** Redimensiona a imagem para caber no armazenamento local. */
async function compressImage(file: File, max = 1200): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  try {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return dataUrl;
  }
}

async function extractPdf(file: File): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const blocks: string[] = [];

  for (let p = 1; p <= Math.min(doc.numPages, 60); p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const text = content.items
      .map((i) => ("str" in i ? i.str : ""))
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (!text) continue;
    text
      .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú])/)
      .reduce<string[]>((acc, sentence) => {
        const last = acc[acc.length - 1];
        if (last && (last + " " + sentence).length < 420) acc[acc.length - 1] = `${last} ${sentence}`;
        else acc.push(sentence);
        return acc;
      }, [])
      .forEach((b) => blocks.push(b.trim()));
  }

  return blocks.filter((b) => b.length > 30);
}

export async function extractFile(file: File): Promise<ExtractedFile> {
  const base: Pick<ExtractedFile, "name" | "source"> = { name: file.name, source: file.name };

  if (file.type.startsWith("image/")) {
    const dataUrl = await compressImage(file);
    return {
      ...base,
      paragraphs: [],
      attachment: { kind: "image", name: file.name, mime: file.type, size: file.size, dataUrl },
    };
  }

  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
    const paragraphs = await extractPdf(file);
    if (!paragraphs.length) throw new Error(`Não consegui extrair texto de ${file.name} (PDF escaneado?).`);
    return {
      ...base,
      paragraphs,
      attachment: { kind: "file", name: file.name, mime: "application/pdf", size: file.size },
    };
  }

  if (file.type.startsWith("text/") || TEXT_EXT.test(file.name)) {
    const text = await readAsText(file);
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!paragraphs.length) throw new Error(`${file.name} está vazio.`);
    return {
      ...base,
      paragraphs,
      attachment: { kind: "file", name: file.name, mime: file.type || "text/plain", size: file.size },
    };
  }

  throw new Error(`Formato não suportado: ${file.name}`);
}
