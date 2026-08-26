import { useCallback, useEffect, useState } from "react";

export type CategoryId = string;

export type Category = { id: CategoryId; label: string; hint: string; custom?: boolean };

export const CATEGORIES: Category[] = [
  { id: "insights", label: "Insights", hint: "Ideias e reflexões" },
  { id: "estudos", label: "Estudos", hint: "Aprendizados e resumos" },
  { id: "trabalho", label: "Trabalho", hint: "Projetos e reuniões" },
  { id: "tarefas", label: "Tarefas", hint: "Ações e pendências" },
];

export type Attachment = {
  kind: "image" | "file";
  name: string;
  mime: string;
  size: number;
  /** data URL — presente apenas para imagens (redimensionadas). */
  dataUrl?: string;
};

export type Note = {
  id: string;
  title: string;
  text: string;
  category: CategoryId;
  tags: string[];
  source: string;
  createdAt: number;
  attachment?: Attachment;
};

const STORAGE_KEY = "agenda-inteligente:notes";
const CATEGORIES_KEY = "agenda-inteligente:categories";

const RULES: { id: CategoryId; words: string[] }[] = [
  {
    id: "tarefas",
    words: ["fazer", "tarefa", "prazo", "entregar", "checklist", "lembrar", "agendar", "todo", "passo"],
  },
  {
    id: "trabalho",
    words: ["reunião", "cliente", "projeto", "equipe", "empresa", "vendas", "produto", "meta", "negócio"],
  },
  {
    id: "estudos",
    words: ["estudo", "aprender", "curso", "conceito", "definição", "exemplo", "teoria", "capítulo", "resumo"],
  },
  {
    id: "insights",
    words: ["ideia", "insight", "reflexão", "percebi", "conclusão", "importante", "essência", "princípio"],
  },
];

export function suggestCategory(text: string): CategoryId {
  const lower = text.toLowerCase();
  let best: { id: CategoryId; score: number } = { id: "insights", score: 0 };
  for (const rule of RULES) {
    const score = rule.words.reduce((acc, w) => (lower.includes(w) ? acc + 1 : acc), 0);
    if (score > best.score) best = { id: rule.id, score };
  }
  return best.id;
}

const STOP = new Set([
  "para","como","que","com","uma","dos","das","por","mais","não","seu","sua","este","esta","isso",
  "the","and","you","are","for","with","from","this","that","your","have","será","pode","sobre","quando",
]);

export function suggestTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const firstSentence = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
  if (firstSentence.length <= 58) return capitalize(firstSentence.replace(/[.!?]$/, ""));
  const words = clean
    .split(" ")
    .filter((w) => w.length > 3 && !STOP.has(w.toLowerCase()))
    .slice(0, 6)
    .join(" ");
  return capitalize((words || clean).slice(0, 58)) + "…";
}

export function suggestTags(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP.has(w));
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isUrl(value: string) {
  return /^(https?:\/\/|www\.)\S+$/i.test(value.trim());
}

export function normalizeUrl(value: string) {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Splits raw pasted content into readable paragraphs/stanzas. */
export function toParagraphs(raw: string): string[] {
  return raw
    .split(/\n{2,}|\n(?=[-*•\d]\s)/)
    .map((p) => p.replace(/\s+$/g, "").trim())
    .filter((p) => p.length > 0);
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function noteToMarkdown(note: Note) {
  return `# ${note.title}\n\n${note.text}\n\n---\nCategoria: ${categoryLabel(note.category)}\nTags: ${note.tags
    .map((t) => `#${t}`)
    .join(" ")}\nCapturado em: ${formatDate(note.createdAt)}\nOrigem: ${note.source}\n`;
}

/* ---------------- categorias (pastas) ---------------- */

function readCategories(): Category[] {
  if (typeof window === "undefined") return CATEGORIES;
  try {
    const raw = window.localStorage.getItem(CATEGORIES_KEY);
    const custom = raw ? (JSON.parse(raw) as Category[]) : [];
    return [...CATEGORIES, ...custom];
  } catch {
    return CATEGORIES;
  }
}

const catListeners = new Set<(c: Category[]) => void>();

export function categoryLabel(id: CategoryId) {
  return readCategories().find((c) => c.id === id)?.label ?? id;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    setCategories(readCategories());
    const l = (c: Category[]) => setCategories(c);
    catListeners.add(l);
    return () => {
      catListeners.delete(l);
    };
  }, []);

  const addCategory = useCallback((label: string) => {
    const clean = label.trim();
    if (!clean) return;
    const id = `custom:${clean.toLowerCase().replace(/\s+/g, "-")}`;
    const current = readCategories();
    if (current.some((c) => c.id === id)) return;
    const custom = current.filter((c) => c.custom);
    const next = [...custom, { id, label: clean, hint: "Pasta personalizada", custom: true }];
    window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
    catListeners.forEach((l) => l([...CATEGORIES, ...next]));
  }, []);

  const removeCategory = useCallback((id: CategoryId) => {
    const custom = readCategories().filter((c) => c.custom && c.id !== id);
    window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(custom));
    catListeners.forEach((l) => l([...CATEGORIES, ...custom]));
  }, []);

  return { categories, addCategory, removeCategory };
}

/* ---------------- notas ---------------- */

function read(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<(n: Note[]) => void>();

function emit(notes: Note[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    /* quota cheia — mantém em memória */
  }
  listeners.forEach((l) => l(notes));
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setNotes(read());
    const listener = (n: Note[]) => setNotes(n);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addNote = useCallback((note: Omit<Note, "id" | "createdAt">) => {
    const full: Note = { ...note, id: crypto.randomUUID(), createdAt: Date.now() };
    emit([full, ...read()]);
    return full;
  }, []);

  const removeNote = useCallback((id: string) => {
    emit(read().filter((n) => n.id !== id));
  }, []);

  return { notes, addNote, removeNote };
}
