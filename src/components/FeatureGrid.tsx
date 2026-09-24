import { Button } from "@/components/ui/button";
import { FEATURES, type Feature } from "@/lib/features";
import { cn } from "@/lib/utils";

export function FeatureGrid({
  variant = "compact",
  features = FEATURES,
  onSelect,
  className,
}: {
  variant?: "compact" | "expanded";
  features?: Feature[];
  onSelect: (feature: Feature) => void;
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <div className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4", className)}>
        {features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            onClick={() => onSelect(feature)}
            className="flex min-h-20 flex-col items-start gap-1.5 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-marker hover:bg-accent active:translate-y-0"
          >
            {/* Alterado de text-marker (azul) para text-foreground (cor padrão) */}
            <feature.icon className="size-5 shrink-0 text-foreground" />
            <span className="text-sm font-semibold leading-tight">{feature.title}</span>
            <span className="truncate text-xs text-muted-foreground">{feature.shortDescription}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {features.map((feature) => (
        <article key={feature.id} className="surface flex flex-col p-5 transition-shadow hover:shadow-float">
          {/* Alterado de bg-marker-soft (azul) para bg-muted (cor neutra) */}
          <span className="grid size-11 place-items-center rounded-2xl bg-muted text-foreground">
            <feature.icon className="size-5" />
          </span>
          <h2 className="mt-3 text-base font-bold tracking-tight">{feature.title}</h2>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            {feature.detailedDescription}
          </p>
          <Button size="lg" className="mt-4 h-11 w-full gap-2" onClick={() => onSelect(feature)}>
            <feature.icon className="size-4" />
            {feature.shortDescription}
          </Button>
        </article>
      ))}
    </div>
  );
}