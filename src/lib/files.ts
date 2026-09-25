import { toParagraphs, type Attachment } from "@/lib/notes";

export type ExtractedFile = {
  paragraphs: string[];
  attachment?: Attachment;
};

const TEXT_EXTENSIONS = ["txt", "md", "csv", "json", "html", "xml", "yml", "yaml"];
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

function ext(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

async function imageToAttachment(file: File): Promise<Attachment> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Não foi possível ler a imagem ${file.name}.`));
    reader.readAsDataURL(file);
  });

  const compressed = await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
      if (scale >= 1) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

  return {
    kind: "image",
    name: file.name,
    mime: file.type || "image/*",
    size: file.size,
    dataUrl: compressed,
  };
}

async function pdfToParagraphs(file: File): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.js",
      import.meta.url,
    ).toString();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const parts: string[] = [];
  const maxPages = Math.min(pdf.numPages, 25);
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();
    if (text) parts.push(text);
  }
  const paragraphs = parts.flatMap(toParagraphs).filter((p) => p.length > 0);
  if (!paragraphs.length) {
    throw new Error(`Não encontrei texto legível no PDF ${file.name}.`);
  }
  return paragraphs.slice(0, 120);
}

async function textToParagraphs(file: File): Promise<string[]> {
  const text = await file.text();
  const paragraphs = toParagraphs(text).slice(0, 120);
  if (!paragraphs.length) {
    throw new Error(`O arquivo ${file.name} está vazio.`);
  }
  return paragraphs;
}

/** Extrai conteúdo capturável de arquivos de texto, PDFs e imagens. */
export async function extractFile(file: File): Promise<ExtractedFile> {
  if (file.type.startsWith("image/")) {
    const attachment = await imageToAttachment(file);
    return { paragraphs: [], attachment };
  }

  const extension = ext(file.name);
  const fileAttachment: Attachment = {
    kind: "file",
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
  };

  if (extension === "pdf" || file.type === "application/pdf") {
    const paragraphs = await pdfToParagraphs(file);
    return { paragraphs, attachment: fileAttachment };
  }

  if (TEXT_EXTENSIONS.includes(extension) || file.type.startsWith("text/")) {
    const paragraphs = await textToParagraphs(file);
    return { paragraphs, attachment: fileAttachment };
  }

  throw new Error(`Tipo de arquivo não suportado: ${file.name}`);
}
