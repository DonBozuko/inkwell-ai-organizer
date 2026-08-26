import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|br)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Lê um link no servidor (sem restrições de CORS) e devolve o texto limpo. */
export const readUrl = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ url: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    const attempts = [`https://r.jina.ai/${data.url}`, data.url];

    for (const target of attempts) {
      try {
        const res = await fetch(target, {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
            accept: "text/html,text/plain,*/*",
          },
        });
        if (!res.ok) continue;
        const body = await res.text();
        const text = /<[a-z][\s\S]*>/i.test(body) ? htmlToText(body) : body.trim();
        if (text.length > 200) return { text, title: extractTitle(body) };
      } catch {
        /* tenta a próxima estratégia */
      }
    }

    throw new Error("Não foi possível ler o conteúdo desse link.");
  });

function extractTitle(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1]?.trim().slice(0, 120) ?? "";
}
