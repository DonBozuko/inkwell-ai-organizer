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
  color?: string;
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

/* ---------------- armazenamento local durável ---------------- */

const DB_NAME = "agenda-inteligente";
const DB_VERSION = 1;
const NOTES_STORE = "notes";
const CATEGORIES_STORE = "categories";

type StoredNote = Note & { attachmentBlob?: Blob };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Este navegador não oferece armazenamento local durável."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
        db.createObjectStore(CATEGORIES_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir o armazenamento local."));
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error ?? new Error("Falha ao ler dados locais."));
    transaction.oncomplete = () => db.close();
  });
}

async function putValue<T>(storeName: string, value: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(value);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error("Falha ao salvar no dispositivo.")); };
    transaction.onabort = () => { db.close(); reject(transaction.error ?? new Error("Espaço insuficiente no dispositivo.")); };
  });
}

async function deleteValue(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).delete(key);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error("Falha ao excluir dado local.")); };
  });
}

function legacyCategories(): Category[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CATEGORIES_KEY);
    return raw ? (JSON.parse(raw) as Category[]) : [];
  } catch { return []; }
}

function readLegacy(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch { return []; }
}

let categoryCache: Category[] = CATEGORIES;
const catListeners = new Set<(categories: Category[]) => void>();
const noteListeners = new Set<(notes: Note[]) => void>();
let noteCache: Note[] = [];
let migrationPromise: Promise<void> | null = null;

async function migrateLegacyData() {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    const [storedNotes, storedCategories] = await Promise.all([
      getAll<StoredNote>(NOTES_STORE),
      getAll<Category>(CATEGORIES_STORE),
    ]);
    if (!storedNotes.length) {
      await Promise.all(readLegacy().map((note) => putValue(NOTES_STORE, note)));
    }
    if (!storedCategories.length) {
      await Promise.all(legacyCategories().filter((category) => category.custom).map((category) => putValue(CATEGORIES_STORE, category)));
    }
  })();
  try { await migrationPromise; } catch (error) { migrationPromise = null; throw error; }
}

async function loadCategories() {
  await migrateLegacyData();
  const custom = await getAll<Category>(CATEGORIES_STORE);
  categoryCache = [...CATEGORIES, ...custom.filter((category) => category.custom)];
  catListeners.forEach((listener) => listener(categoryCache));
}

export function categoryLabel(id: CategoryId) {
  return categoryCache.find((category) => category.id === id)?.label ?? id;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(categoryCache);

  useEffect(() => {
    const listener = (next: Category[]) => setCategories(next);
    catListeners.add(listener);
    void loadCategories().catch(() => setCategories(CATEGORIES));
    return () => { catListeners.delete(listener); };
  }, []);

  const addCategory = useCallback(async (label: string) => {
    const clean = label.trim();
    if (!clean) return;
    const slug = clean.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const id = `custom:${slug}`;
    if (!slug || categoryCache.some((category) => category.id === id)) return;
    await putValue<Category>(CATEGORIES_STORE, { id, label: clean, hint: "Pasta personalizada", custom: true });
    await loadCategories();
  }, []);

  const removeCategory = useCallback(async (id: CategoryId) => {
    if (!id.startsWith("custom:")) return;
    await deleteValue(CATEGORIES_STORE, id);
    await loadCategories();
  }, []);

  return { categories, addCategory, removeCategory };
}

function emitNotes(notes: Note[]) {
  noteCache = notes;
  noteListeners.forEach((listener) => listener(notes));
}

async function loadNotes() {
  await migrateLegacyData();
  const stored = await getAll<StoredNote>(NOTES_STORE);
  const notes = stored
    .map(({ attachmentBlob: _attachmentBlob, ...note }) => note)
    .sort((a, b) => b.createdAt - a.createdAt);
  emitNotes(notes);
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(noteCache);

  useEffect(() => {
    const listener = (next: Note[]) => setNotes(next);
    noteListeners.add(listener);
    void loadNotes().catch(() => setNotes(readLegacy()));
    return () => { noteListeners.delete(listener); };
  }, []);

  const addNote = useCallback(async (note: Omit<Note, "id" | "createdAt">, file?: File) => {
    const stored: StoredNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      color: "blue",
      ...(file ? { attachmentBlob: file } : {}),
    };
    await putValue<StoredNote>(NOTES_STORE, stored);
    await loadNotes();
  }, []);

  const removeNote = useCallback(async (id: string) => {
    await deleteValue(NOTES_STORE, id);
    emitNotes(noteCache.filter((note) => note.id !== id));
  }, []);

  return { notes, addNote, removeNote };
}
