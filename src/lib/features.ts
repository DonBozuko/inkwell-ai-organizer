import {
  ClipboardPaste,
  Download,
  FileUp,
  FolderPlus,
  LayoutList,
  ListTodo,
  Moon,
  NotebookPen,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { noteToMarkdown, type Note } from "@/lib/notes";

export type FeatureAction =
  | "prefill"
  | "clipboard"
  | "upload"
  | "sample"
  | "open-agenda"
  | "new-folder"
  | "export-md"
  | "toggle-theme";

export type Feature = {
  id: string;
  icon: LucideIcon;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  action: FeatureAction;
  /** Texto inserido no campo de captura para ações de template. */
  template?: string;
};

/** Ações que só fazem sentido com o campo de captura da home. */
export const CAPTURE_ACTIONS: FeatureAction[] = ["prefill", "clipboard", "upload", "sample"];

export const SAMPLE_TEXT = `A produtividade real não vem de fazer mais coisas, e sim de decidir melhor o que merece sua atenção hoje.

Ideia importante: capturar é diferente de organizar. Capture rápido, organize depois, em lotes curtos.

Tarefa: revisar o roteiro do projeto com a equipe até sexta e definir o prazo de entrega do cliente.

Estudo: o conceito de carga cognitiva mostra que a memória de trabalho comporta poucos itens por vez.`;

export const FEATURES: Feature[] = [
  {
    id: "nova-nota",
    icon: NotebookPen,
    title: "Nova nota",
    shortDescription: "Comece do zero",
    detailedDescription:
      "Abre o campo de captura já preparado com um modelo de nota livre para você escrever e salvar na pasta certa.",
    action: "prefill",
    template: "Nota: ",
  },
  {
    id: "ideia-rapida",
    icon: Sparkles,
    title: "Ideia rápida",
    shortDescription: "Registre um insight",
    detailedDescription:
      "Modelo curto para registrar um insight antes que ele escape. A IA sugere o título e classifica em Insights.",
    action: "prefill",
    template: "Ideia importante: ",
  },
  {
    id: "tarefa-urgente",
    icon: ListTodo,
    title: "Tarefa urgente",
    shortDescription: "Ação com prazo",
    detailedDescription:
      "Modelo com prazo para pendências. O texto é reconhecido como Tarefa na organização automática.",
    action: "prefill",
    template: "Tarefa urgente: ",
  },
  {
    id: "colar",
    icon: ClipboardPaste,
    title: "Colar",
    shortDescription: "Da área de transferência",
    detailedDescription:
      "Lê o que está copiado e joga direto no campo de captura. Se o navegador bloquear, avisamos para colar manualmente.",
    action: "clipboard",
  },
  {
    id: "enviar-arquivo",
    icon: FileUp,
    title: "Enviar arquivo",
    shortDescription: "PDF, imagem ou texto",
    detailedDescription:
      "Abre o seletor de arquivos para enviar PDFs, imagens, textos ou pastas inteiras e transformá-los em trechos capturáveis.",
    action: "upload",
  },
  {
    id: "exemplo",
    icon: Zap,
    title: "Ver exemplo",
    shortDescription: "Texto formatado pronto",
    detailedDescription:
      "Carrega um texto de exemplo já formatado para você experimentar o marcador azul e a captura por parágrafo.",
    action: "sample",
  },
  {
    id: "abrir-agenda",
    icon: LayoutList,
    title: "Abrir a Agenda",
    shortDescription: "Ver notas salvas",
    detailedDescription: "Vai para o dashboard com todas as notas capturadas, filtros por pasta e atalhos rápidos.",
    action: "open-agenda",
  },
  {
    id: "nova-pasta",
    icon: FolderPlus,
    title: "Nova pasta",
    shortDescription: "Categoria personalizada",
    detailedDescription:
      "Cria uma pasta personalizada para organizar notas além das categorias sugeridas pela IA.",
    action: "new-folder",
  },
  {
    id: "exportar-md",
    icon: Download,
    title: "Exportar Markdown",
    shortDescription: "Baixe todas as notas",
    detailedDescription:
      "Gera um único arquivo .md com todas as notas salvas no dispositivo, com título, data e origem de cada uma.",
    action: "export-md",
  },
  {
    id: "tema",
    icon: Moon,
    title: "Alternar tema",
    shortDescription: "Claro ou escuro",
    detailedDescription: "Troca entre o modo claro e o modo escuro. A preferência fica salva no dispositivo.",
    action: "toggle-theme",
  },
];

export function featureById(id: string) {
  return FEATURES.find((feature) => feature.id === id);
}

export const THEME_EVENT = "agenda-theme-change";
const THEME_KEY = "agenda-theme";

export function isDarkTheme() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(dark: boolean) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
  window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  window.dispatchEvent(new CustomEvent<boolean>(THEME_EVENT, { detail: dark }));
}

export function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  applyTheme(next);
  return next;
}

export function exportNotesMarkdown(notes: Note[]) {
  if (!notes.length) return false;
  const body = [
    "# Minhas notas — Agenda Inteligente",
    "",
    `Exportado em ${new Date().toLocaleString("pt-BR")} · ${notes.length} nota(s)`,
    "",
    ...notes.map((note) => noteToMarkdown(note)),
  ].join("\n\n");

  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "agenda-inteligente-notas.md";
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
