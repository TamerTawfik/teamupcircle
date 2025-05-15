"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ListTodo } from "lucide-react";
import { useAnimate } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  HighlighterItem,
  HighlightGroup,
  Particles,
} from "@/components/sections/github-cta/highlighter";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

export function GithubCTA({ className }: { className?: string }) {
  const [scope, animate] = useAnimate();

  React.useEffect(() => {
    animate(
      [
        ["#pointer", { left: 200, top: 60 }, { duration: 0 }],
        ["#openIssue", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 50, top: 102 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#openIssue", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#requestFeature", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 224, top: 170 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#requestFeature", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#reportBug", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 88, top: 198 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#reportBug", { opacity: 0.4 }, { at: "-0.3", duration: 0.1 }],
        ["#pullRequest", { opacity: 1 }, { duration: 0.3 }],
        [
          "#pointer",
          { left: 200, top: 60 },
          { at: "+0.5", duration: 0.5, ease: "easeInOut" },
        ],
        ["#pullRequest", { opacity: 0.5 }, { at: "-0.3", duration: 0.1 }],
      ],
      {
        repeat: Number.POSITIVE_INFINITY,
      }
    );
  }, [animate]);
  return (
    <div className="text-center">
      <div className={cn(className)}>
        <section className="relative mx-auto mb-8  max-w-5xl  ">
          <h3 className="mb-14 text-2xl md:text-4xl max-w-[300px] sm:max-w-none mx-auto text-foreground-lighter">
            Your ideas, code, and feedback drive our evolution,
            <br className="hidden sm:block" />
            Proudly Open Source.
          </h3>
          <HighlightGroup className="group h-full">
            <div
              className="group/item h-full md:col-span-6 lg:col-span-12"
              data-aos="fade-down"
            >
              <HighlighterItem className="rounded-3xl p-6">
                <div className="relative z-20 h-full overflow-hidden rounded-3xl border border-primary">
                  <Particles
                    className="absolute inset-0 -z-10 opacity-10 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                    quantity={200}
                    color={"#555555"}
                    vy={-0.2}
                  />
                  <div className="flex justify-center">
                    <div className="flex h-full flex-col justify-center gap-10 p-4 md:h-[300px] md:flex-row">
                      <div
                        className="relative mx-auto h-[270px] w-[300px] md:h-[270px] md:w-[300px]"
                        ref={scope}
                      >
                        <Logo className="absolute left-2/3 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />
                        <div
                          id="pullRequest"
                          className="absolute bottom-12 left-14 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          Pull request
                        </div>
                        <div
                          id="requestFeature"
                          className="absolute left-1 top-20 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          Request feature
                        </div>
                        <div
                          id="reportBug"
                          className="absolute bottom-20 right-1 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          Report a bug
                        </div>
                        <div
                          id="openIssue"
                          className="absolute right-12 top-10 rounded-3xl border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs opacity-50 dark:border-slate-600 dark:bg-slate-800"
                        >
                          Open issue
                        </div>

                        <div id="pointer" className="absolute">
                          <svg
                            width="16.8"
                            height="18.2"
                            viewBox="0 0 12 13"
                            className="fill-red-500"
                            stroke="white"
                            strokeWidth="1"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 5.50676L0 0L2.83818 13L6.30623 7.86537L12 5.50676V5.50676Z"
                            />
                          </svg>
                          <span className="bg-ali relative -top-1 left-3 rounded-3xl px-2 py-1 text-xs text-white">
                            You
                          </span>
                        </div>
                      </div>

                      <div className="-mt-20 flex h-full flex-col justify-center p-2 md:-mt-4 md:ml-10 md:w-[400px]">
                        <div className="flex flex-col items-center">
                          <h3 className="mt-6   pb-1 ">
                            <span className="text-2xl md:text-2xl">
                              Built by developers for developers.
                            </span>
                          </h3>
                        </div>
                        <p className="mb-4 text-[#707070]">
                          Together, we build, improve, and shape the future.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link href={siteConfig.links.github} target="_blank">
                            <Button>Contribute on GitHub</Button>
                          </Link>
                          <Link
                            href="https://github.com/users/TamerTawfik/projects/3/views/2"
                            target="_blank"
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                              })
                            )}
                          >
                            <span className="flex items-center gap-1">
                              <ListTodo strokeWidth={1} className="h-5 w-5" />
                            </span>
                            Kanban Board
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </HighlighterItem>
            </div>
          </HighlightGroup>
        </section>
      </div>
    </div>
  );
}
