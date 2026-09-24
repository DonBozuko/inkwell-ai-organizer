import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    className={cn("", className)}
    {...props}
  />
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, value, id, ...props }, ref) => {
  // Derive a unique id for the content so we can hook up aria-controls
  const contentId = React.useId();
  const triggerId = id ?? `accordion-trigger-${contentId}`;

  React.useEffect(() => {
    // Keep Radix's internal state and our aria-* attributes in sync.
    // The rendered DOM node is the <button> that Radix creates inside
    // AccordionPrimitive.Trigger.
    const trigger = document.getElementById(triggerId) as
      | (HTMLElement & {
          contentElement?: HTMLElement;
          state?: string;
        })
      | null;

    if (!trigger) return;

    const update = () => {
      const state = trigger.dataset.state;
      if (state) {
        trigger.setAttribute("aria-expanded", state === "open" ? "true" : "false");
      }
      trigger.setAttribute("aria-controls", contentId);
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(trigger, { attributes: true, attributeFilter: ["data-state"] });

    return () => observer.disconnect();
  }, [triggerId]);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        id={triggerId}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const contentId = React.useId();

  return (
    <AccordionPrimitive.Content
      ref={ref}
      id={contentId}
      tabIndex={0}
      className="overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };