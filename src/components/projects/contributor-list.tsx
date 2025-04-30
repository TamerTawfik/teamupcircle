"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

interface ContributorListProps {
  contributors: Contributor[];
  maxVisible?: number;
}

export function ContributorList({
  contributors,
  maxVisible = 5, // Default to showing 5 avatars
}: ContributorListProps) {
  if (!contributors || contributors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No contributors found.</p>
    );
  }

  const visibleContributors = contributors.slice(0, maxVisible);
  const remainingCount = contributors.length - maxVisible;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex -space-x-3 items-center py-1">
        {visibleContributors.map((c) => (
          <Tooltip key={c.login}>
            <TooltipTrigger asChild>
              <Link
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Avatar className="h-9 w-9 border-2 border-background hover:ring-2 hover:ring-primary transition-all duration-200">
                  <AvatarImage src={c.avatar_url} alt={c.login} />
                  <AvatarFallback>
                    {c.login?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                {c.login} ({c.contributions} contributions)
              </p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-9 w-9 border-2 border-background bg-muted flex items-center justify-center">
                <AvatarFallback className="text-xs font-medium">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>+{remainingCount} more contributors</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
