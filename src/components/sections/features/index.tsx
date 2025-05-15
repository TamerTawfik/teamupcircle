"use client";

import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
// import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ReactNode, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SectionContainer from "@/components/sections/section-container";
import { INITIAL_BOTTOM, getAnimation } from "@/lib/animations";
import FeatureIcon from "./feature-icon";

interface Feature {
  title: string;
  text: string;
}
interface Props {
  id?: string;
  title: string | ReactNode;
  paragraph: string;
  cta?: {
    label?: string;
    link: string;
  };
  features?: Feature[];
  className?: string;
  hasStickyTitle?: boolean;
}

const FeaturesSection = ({
  id,
  title,
  paragraph,
  cta,
  features,
  className,
  hasStickyTitle,
}: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-5%", once: true });

  return (
    <LazyMotion features={domAnimation}>
      <SectionContainer id={id} className={className}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 xl:gap-10 justify-between">
          <div className="col-span-full h-full lg:col-span-4">
            <div
              className={cn(
                "gap-2 flex flex-col items-start",
                hasStickyTitle && "sticky top-24"
              )}
            >
              <h2 className="text-2xl sm:text-3xl xl:text-4xl max-w-[280px] sm:max-w-xs xl:max-w-[360px] tracking-[-1px]">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{paragraph}</p>
              {cta && (
                <Button asChild>
                  {/* <ArrowUpRight /> */}
                  <Link href={cta.link}>
                    {cta.label ?? "Explore documentation"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
          {features && (
            <div
              ref={ref}
              className="col-span-full lg:col-start-6 lg:col-span-7 space-y-10 lg:space-y-0 flex flex-col lg:grid lg:grid-cols-2 lg:gap-16"
            >
              {features.map((feature: Feature, i: number) => (
                <Feature
                  feature={feature}
                  index={i}
                  isInView={isInView}
                  key={feature.title}
                />
              ))}
            </div>
          )}
        </div>
      </SectionContainer>
    </LazyMotion>
  );
};

const Feature = ({
  feature,
  index,
  isInView,
}: {
  feature: Feature;
  index: number;
  isInView: boolean;
}) => {
  const initial = INITIAL_BOTTOM;
  const animate = getAnimation({ delay: index * 0.1 });

  return (
    <m.div
      className="h-full flex items-start space-x-3 w-full"
      initial={initial}
      animate={isInView ? animate : initial}
    >
      <FeatureIcon icon={"M20 6 9 17l-5-5"} color="alt" />
      <div className="text-sm lg:text-base">
        <h2 className="text-base">{feature.title}</h2>
        <div className="prose pt-1 text-sm text-muted-foreground">
          <ReactMarkdown>{feature.text}</ReactMarkdown>
        </div>
      </div>
    </m.div>
  );
};

export default FeaturesSection;
