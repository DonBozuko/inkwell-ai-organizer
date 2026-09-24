import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, header, footer, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (props.onClick) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          props.onClick(e as any);
        }
      }
      if (props.onKeyDown) props.onKeyDown(e);
    };

    const tabIndex = props.onClick ? 0 : undefined;
    const roleAttr = props.onClick ? "button" : undefined;

    return (
      <section
        ref={ref}
        role={roleAttr ?? "region"}
        tabIndex={tabIndex}
        className={cn(
          "rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {header && (
          <header className="flex flex-col space-y-1.5 p-6">
            {header}
          </header>
        )}
        {props.children}
        {footer && (
          <footer className="flex items-center p-6 pt-0">
            {footer}
          </footer>
        )}
      </section>
    );
  },
);
Card.displayName = "Card";

type CardHeaderProps = React.HTMLAttributes<HTMLElement>;

const CardHeader = React.forwardRef<HTMLElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

type CardContentProps = React.HTMLAttributes<HTMLElement>;

const CardContent = React.forwardRef<HTMLElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

type CardFooterProps = React.HTMLAttributes<HTMLElement>;

const CardFooter = React.forwardRef<HTMLElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};