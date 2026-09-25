import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { extractTitle, htmlToText } from "@/lib/reader.server";

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
