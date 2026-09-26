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
        {FEATURES.map((feature) => (
          <article key={feature.id} className="surface flex flex-col gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-marker-soft text-marker">
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
              className="mt-auto h-11 gap-2"
              onClick={() => onSelect(feature)}
            >
              Usar função
              <ArrowRight className="size-4" />
            </Button>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {FEATURES.map((feature) => (
        <button
          key={feature.id}
          type="button"
          onClick={() => onSelect(feature)}
          className={cn(
            "flex flex-col items-start gap-1.5 rounded-xl border border-border p-3 text-left transition-colors",
            "hover:border-marker hover:bg-marker-soft",
          )}
        >
          <span className="grid size-8 place-items-center rounded-lg bg-marker-soft text-marker">
            <feature.icon className="size-4" />
          </span>
          <span className="text-sm font-semibold leading-tight">{feature.title}</span>
          <span className="text-xs leading-snug text-muted-foreground">
            {feature.shortDescription}
          </span>
        </button>
      ))}
    </div>
  );
}
