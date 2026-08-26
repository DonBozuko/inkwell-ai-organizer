import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

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

let sessionPromise: ReturnType<typeof createSession> | null = null;

async function createSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) return data.session.user;
  const { data: signed, error } = await supabase.auth.signInAnonymously();
  if (error || !signed.user) throw new Error("Não foi possível abrir seu espaço de notas.");
  return signed.user;
}

async function currentUser() {
  sessionPromise ??= createSession();
  try {
    return await sessionPromise;
  } catch (error) {
    sessionPromise = null;
    throw error;
  }
}

function legacyCategories(): Category[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CATEGORIES_KEY);
    return raw ? (JSON.parse(raw) as Category[]) : [];
  } catch { return []; }
}

let categoryCache: Category[] = CATEGORIES;

async function loadCategories() {
  const user = await currentUser();
  const { data, error } = await supabase.from("categories").select("slug,label,hint").eq("user_id", user.id);
  if (error) throw error;
  const cloud = (data ?? []).map((c) => ({ id: `custom:${c.slug}`, label: c.label, hint: c.hint, custom: true }));
  categoryCache = [...CATEGORIES, ...cloud];
  catListeners.forEach((listener) => listener(categoryCache));
}

const catListeners = new Set<(c: Category[]) => void>();

export function categoryLabel(id: CategoryId) {
  return categoryCache.find((c) => c.id === id)?.label ?? id;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    void loadCategories().catch(() => setCategories([...CATEGORIES, ...legacyCategories()]));
    const l = (c: Category[]) => setCategories(c);
    catListeners.add(l);
    return () => {
      catListeners.delete(l);
    };
  }, []);

  const addCategory = useCallback(async (label: string) => {
    const clean = label.trim();
    if (!clean) return;
    const slug = clean.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug || categoryCache.some((c) => c.id === `custom:${slug}`)) return;
    const user = await currentUser();
    const { error } = await supabase.from("categories").insert({ user_id: user.id, slug, label: clean });
    if (error) throw error;
    await loadCategories();
  }, []);

  const removeCategory = useCallback(async (id: CategoryId) => {
    if (!id.startsWith("custom:")) return;
    const user = await currentUser();
    const { error } = await supabase.from("categories").delete().eq("user_id", user.id).eq("slug", id.slice(7));
    if (error) throw error;
    await loadCategories();
  }, []);

  return { categories, addCategory, removeCategory };
}

/* ---------------- notas ---------------- */

function readLegacy(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<(n: Note[]) => void>();
let noteCache: Note[] = [];

function emit(notes: Note[]) {
  noteCache = notes;
  listeners.forEach((l) => l(notes));
}

async function loadNotes() {
  const user = await currentUser();
  const { data, error } = await supabase.from("notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  const notes = await Promise.all((data ?? []).map(async (row): Promise<Note> => {
    let dataUrl: string | undefined;
    if (row.attachment_path && row.attachment_kind === "image") {
      const { data: signed } = await supabase.storage.from("note-attachments").createSignedUrl(row.attachment_path, 3600);
      dataUrl = signed?.signedUrl;
    }
    return {
      id: row.id, title: row.title, text: row.text, category: row.category, tags: row.tags,
      source: row.source, createdAt: new Date(row.created_at).getTime(),
      ...(row.attachment_kind && row.attachment_name ? { attachment: {
        kind: row.attachment_kind as Attachment["kind"], name: row.attachment_name,
        mime: row.attachment_mime ?? "application/octet-stream", size: row.attachment_size ?? 0,
        ...(dataUrl ? { dataUrl } : {}),
      } } : {}),
    };
  }));
  emit(notes);
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    void loadNotes().catch(() => setNotes(readLegacy()));
    const listener = (n: Note[]) => setNotes(n);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addNote = useCallback(async (note: Omit<Note, "id" | "createdAt">, file?: File) => {
    const user = await currentUser();
    const id = crypto.randomUUID();
    let attachmentPath: string | null = null;
    let uploadFile = file;
    if (!uploadFile && note.attachment?.dataUrl) {
      uploadFile = await fetch(note.attachment.dataUrl).then((response) => response.blob()).then((blob) => new File([blob], note.attachment?.name ?? "imagem.jpg", { type: blob.type }));
    }
    if (uploadFile) {
      attachmentPath = `${user.id}/${id}/${uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("note-attachments").upload(attachmentPath, uploadFile);
      if (uploadError) throw uploadError;
    }
    const { error } = await supabase.from("notes").insert({
      id, user_id: user.id, title: note.title, text: note.text, category: note.category,
      tags: note.tags, source: note.source, attachment_kind: note.attachment?.kind ?? null,
      attachment_name: note.attachment?.name ?? null, attachment_mime: note.attachment?.mime ?? null,
      attachment_size: note.attachment?.size ?? null, attachment_path: attachmentPath,
    });
    if (error) {
      if (attachmentPath) await supabase.storage.from("note-attachments").remove([attachmentPath]);
      throw error;
    }
    await loadNotes();
  }, []);

  const removeNote = useCallback(async (id: string) => {
    const user = await currentUser();
    const { data } = await supabase.from("notes").select("attachment_path").eq("id", id).eq("user_id", user.id).maybeSingle();
    const { error } = await supabase.from("notes").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    if (data?.attachment_path) await supabase.storage.from("note-attachments").remove([data.attachment_path]);
    emit(noteCache.filter((note) => note.id !== id));
  }, []);

  return { notes, addNote, removeNote };
}
