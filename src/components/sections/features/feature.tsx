import { cn } from "@/lib/utils";
import * as React from "react";

const Feature = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-left flex flex-col gap-4", className)}
    {...props}
  />
));
Feature.displayName = "Feature";

const FeatureHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
));
FeatureHeader.displayName = "FeatureHeader";

const FeatureTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base tracking-tight font-medium leading-6 text-black dark:text-white",
      className
    )}
    {...props}
  />
));
FeatureTitle.displayName = "FeatureTitle";

const FeatureContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-foreground/70 dark:text-white/60 font-normal text-sm leading-6",
      className
    )}
    {...props}
  />
));
FeatureContent.displayName = "FeatureContent";

export { Feature, FeatureHeader, FeatureTitle, FeatureContent };
