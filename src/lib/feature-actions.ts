import { toast } from "sonner";

import { exportNotesMarkdown, toggleTheme, type Feature } from "@/lib/features";
import type { Note } from "@/lib/notes";

export function handleSharedFeature(feature: Feature, notes: Note[], openAgenda: () => void) {
  switch (feature.action) {
    case "open-agenda":
      openAgenda();
      return;
    case "new-folder":
      openAgenda();
      toast.info("Crie a pasta na lista de categorias.", {
        description: "Use “Nova pasta” na barra lateral (ou no menu de categorias).",
      });
      return;
    case "export-md":
      if (!exportNotesMarkdown(notes)) {
        toast.info("Nenhuma nota para exportar ainda.");
        return;
      }
      toast.success("Exportação iniciada!", { description: "Arquivo .md salvo no dispositivo." });
      return;
    case "toggle-theme": {
      const dark = toggleTheme();
      toast.success(dark ? "Modo escuro ativado." : "Modo claro ativado.");
      return;
    }
    default:
      toast.info("Função em breve.");
  }
}
