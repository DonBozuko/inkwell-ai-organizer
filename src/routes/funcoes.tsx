import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { FeatureGrid } from "@/components/FeatureGrid";
import { CAPTURE_ACTIONS, type Feature } from "@/lib/features";
import { handleSharedFeature } from "@/lib/feature-actions";
import { useNotes } from "@/lib/notes";

export const Route = createFileRoute("/funcoes")({
  head: () => ({
    meta: [
      { title: "Melhores Funções — Agenda por Captura" },
      {
        name: "description",
        content:
          "Atalhos rápidos para capturar notas, colar textos, enviar arquivos, exportar em Markdown e organizar pastas.",
      },
      { property: "og:title", content: "Melhores Funções — Agenda por Captura" },
      {
        property: "og:description",
        content: "Todos os atalhos do app em um só lugar: captura rápida, upload, exportação e temas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FuncoesPage,
});

function FuncoesPage() {
  const navigate = useNavigate();
  const { notes } = useNotes();

  const handle = (feature: Feature) => {
    if (CAPTURE_ACTIONS.includes(feature.action)) {
      void navigate({ to: "/", search: { action: feature.id } });
      return;
    }

    handleSharedFeature(feature, notes, () => {
      void navigate({ to: "/agenda", search: { cat: "todas" } });
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Melhores Funções</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Todos os atalhos do app reunidos. Toque em uma função para executá-la agora.
          </p>
        </header>

        <FeatureGrid variant="expanded" onSelect={handle} />
      </div>
    </AppShell>
  );
}
