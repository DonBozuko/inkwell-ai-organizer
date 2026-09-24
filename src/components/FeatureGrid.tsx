import { Button } from "@/components/ui/button";
import { FEATURES, type Feature } from "@/lib/features";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface FeatureGridProps {
  variant?: "compact" | "expanded";
  features?: Feature[];
  onSelect: (feature: Feature) => void;
  className?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = memo(({ variant = "compact", features = FEATURES, onSelect, className, }: FeatureGridProps) => {
  const getTitleClass = (title: string) =>
    title === "Agenda Inteligente" ? "text-primary" : "";

  if (variant === "compact") {
    return (
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5",
            className,
          )}
        >
        {features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            aria-label={\`${feature.title}: ${feature.shortDescription}\`}
            onClick={() => onSelect(feature)}
            className="flex min-h-20 flex-col items-start gap-1.5 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-marker hover:bg-accent active:translate-y-0"
          >
            <feature.icon className="size-5 shrink-0 text-foreground" />
            <span
              className={cn(
                "text-sm font-semibold leading-tight",
                getTitleClass(feature.title),
              )}
            >
              {feature.title}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {feature.shortDescription}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
      <div
        className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}
      >
      {features.map((feature) => (
        <article
          key={feature.id}
          role="button"
          tabIndex={0}
          aria-label={`${feature.title}: ${feature.shortDescription}`}
          className="surface flex flex-col p-5 transition-shadow hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => onSelect(feature)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(feature);
            }
          }}
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-muted text-foreground">
            <feature.icon className="size-5" />
          </span>
          <h2
            className={cn(
              "mt-3 text-base font-bold tracking-tight",
              getTitleClass(feature.title),
            )}
          >
            {feature.title}
          </h2>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            {feature.detailedDescription}
          </p>
          <Button
            size="lg"
            className="mt-4 h-11 w-full gap-2"
            aria-label={\`${feature.title}: ${feature.shortDescription}\`}
            onClick={() => onSelect(feature)}
          >
            <feature.icon className="size-4" />
            {feature.shortDescription}
          </Button>
        </article>
      ))}
    </div>
  );
}