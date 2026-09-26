import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FEATURES, type Feature } from "@/lib/features";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "compact" | "expanded";
  onSelect: (feature: Feature) => void;
};

export function FeatureGrid({ variant = "compact", onSelect }: Props) {
  if (variant === "expanded") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => {
          const isSmartAgenda = feature.id === "smart-agenda" || feature.title.toLowerCase().includes("agenda inteligente");
          return (
            <article key={feature.id} className={cn("surface flex flex-col gap-3 p-5", isSmartAgenda && "bg-amber-950/20 border-amber-800/40")}>
              <div className="flex items-center gap-3">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-marker-soft text-marker", isSmartAgenda && "!bg-amber-900/40 !text-amber-700 dark:!text-amber-400")}>
                  <feature.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold tracking-tight">{feature.title}</h2>
                  <p className="text-xs text-muted-foreground">{feature.shortDescription}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.detailedDescription}
              </p>
              <Button
                variant="outline"
                size="lg"
                className={cn("mt-auto h-11 gap-2", isSmartAgenda && "border-amber-700/50 hover:bg-amber-900/20 text-amber-900 dark:text-amber-200")}
                onClick={() => onSelect(feature)}
              >
                Usar função
                <ArrowRight className="size-4" />
              </Button>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {FEATURES.map((feature) => {
        const isSmartAgenda = feature.id === "smart-agenda" || feature.title.toLowerCase().includes("agenda inteligente");
        return (
          <button
            key={feature.id}
            type="button"
            onClick={() => onSelect(feature)}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-xl border border-border p-3 text-left transition-colors",
              "hover:border-marker hover:bg-marker-soft",
              isSmartAgenda && "bg-amber-950/10 border-amber-800/30 hover:border-amber-700 hover:bg-amber-900/20"
            )}
          >
            <span className={cn("grid size-8 place-items-center rounded-lg bg-marker-soft text-marker", isSmartAgenda && "!bg-amber-900/40 !text-amber-700 dark:!text-amber-400")}>
              <feature.icon className="size-4" />
            </span>
            <span className={cn("text-sm font-semibold leading-tight", isSmartAgenda && "text-amber-900 dark:text-amber-200")}>{feature.title}</span>
            <span className="text-xs leading-snug text-muted-foreground">
              {feature.shortDescription}
            </span>
          </button>
        );
      })}
    </div>
  );
}