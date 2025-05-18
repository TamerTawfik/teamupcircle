import { Ref, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const sectionContainer = cva("max-w-7xl relative mx-auto px-6", {
  variants: {
    width: {
      normal: "lg:px-16 xl:px-20",
      smallScreenFull: "max-w-full lg:container px-0",
    },
    height: {
      normal: "py-16 md:py-24 lg:py-24",
      narrow: "py-6 md:py-8",
      none: "",
    },
  },
  defaultVariants: {
    width: "normal",
    height: "normal",
  },
});

interface Props extends VariantProps<typeof sectionContainer> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 *
 * @param width - 'normal' (default) or 'full'
 * @param height - 'normal' (default) or 'narrow'
 */
const SectionContainer = forwardRef(
  (
    { children, className, id, width, height }: Props,
    ref: Ref<HTMLDivElement>
  ) => (
    <div
      ref={ref}
      id={id}
      className={cn(sectionContainer({ width, height }), className)}
    >
      {children}
    </div>
  )
);

SectionContainer.displayName = "SectionContainer";

export default SectionContainer;
