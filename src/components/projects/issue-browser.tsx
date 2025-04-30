"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

type IssueLabel = { name: string };
type Issue = {
  number: number;
  title: string;
  html_url: string;
  state: string;
  labels: IssueLabel[];
  created_at: string;
};

interface IssueBrowserProps {
  issues: Issue[];
  repoUrl?: string | null;
}

export function IssueBrowser({ issues, repoUrl }: IssueBrowserProps) {
  if (!issues || issues.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No open issues found.</p>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((i) => (
        <div
          key={i.number}
          className="p-4 border rounded-lg bg-card shadow-sm text-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start gap-2 mb-2">
            <Link
              href={i.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline break-words"
            >
              #{i.number} {i.title}
            </Link>
            <Badge
              variant={i.state === "open" ? "default" : "destructive"}
              className={cn(
                "text-xs capitalize flex-shrink-0 whitespace-nowrap",
                i.state === "open" &&
                  "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400",
                i.state === "closed" &&
                  "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {i.state}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {i.labels?.map((label) => (
              <Badge
                key={label.name}
                variant="secondary"
                className="text-xs px-1.5 py-0.5"
              >
                {label.name}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Opened on {new Date(i.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
      {repoUrl && (
        <Link
          href={`${repoUrl}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-primary hover:underline pt-2"
        >
          View all issues on GitHub...
        </Link>
      )}
    </div>
  );
}
