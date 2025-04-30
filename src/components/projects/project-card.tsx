import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, GitFork, AlertCircle, Scale, Tag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Project, User } from "@prisma/client";

export type ProjectCardData = Project & {
  owner: Pick<User, "id" | "name" | "username" | "image">;
  _count: {
    members: number;
  };
  // Optional GitHub details
  stars?: number | null;
  forks?: number | null;
  openIssuesCount?: number | null;
  license?: { name: string } | null;
};

interface ProjectCardProps {
  project: ProjectCardData;
  userId: string;
  onClick: () => void; // Handle click for opening drawer/details
}

// Helper component for icon + text pairs to handle optional data gracefully
const InfoItem: React.FC<{
  icon: React.ElementType;
  value: string | number | undefined | null;
  label?: string; // Optional label for screen readers or tooltips
  hideIfNull?: boolean;
}> = ({ icon: Icon, value, label, hideIfNull = false }) => {
  if (hideIfNull && (value === undefined || value === null || value === "")) {
    return null;
  }
  const displayValue = value ?? "N/A";
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={
        label || (typeof displayValue === "string" ? displayValue : undefined)
      }
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="truncate text-xs" title={String(displayValue)}>
        {displayValue}
      </span>
    </div>
  );
};

export function ProjectCard({ project, userId, onClick }: ProjectCardProps) {
  const isOwner = project.ownerId === userId;
  const memberCount = project._count.members + 1;

  // Prepare data for InfoItems
  const licenseName = project.license?.name ?? "N/A";

  return (
    <div className="block group cursor-pointer h-full" onClick={onClick}>
      <Card className="h-full flex flex-col transition-all duration-200 group-hover:shadow-lg group-hover:border-primary/50">
        <CardHeader className="pb-3">
          {" "}
          <CardTitle
            className="text-lg truncate group-hover:text-primary"
            title={project.name}
          >
            {project.name}
          </CardTitle>
          {project.isBeginnerFriendly && (
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 w-fit mt-1 text-green-700 border-green-300"
            >
              Beginner Friendly
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between space-y-3 pt-0">
          {" "}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
          {/* Required Roles - Conditionally render */}
          {project.requiredRoles && project.requiredRoles.length > 0 && (
            <div className="flex flex-col gap-1 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 font-medium">
                <Tag className="h-3.5 w-3.5" />
                <span>Roles Needed:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredRoles.slice(0, 3).map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 font-normal"
                  >
                    {role}
                  </Badge>
                ))}
                {project.requiredRoles.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 font-normal"
                  >
                    +{project.requiredRoles.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          {/* GitHub Stats & License  */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <InfoItem icon={Star} value={project.stars} label="GitHub Stars" />
            <InfoItem
              icon={GitFork}
              value={project.forks}
              label="GitHub Forks"
            />
            <InfoItem
              icon={AlertCircle}
              value={project.openIssuesCount}
              label="Open Issues"
            />
            <InfoItem icon={Scale} value={licenseName} label="License" />
          </div>
          {/* Footer Info (Members & Owner) */}
          <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {memberCount} Member{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
            {/* Owner Info - only show if current user is NOT the owner */}
            {!isOwner && (
              <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                <Avatar className="h-4 w-4 border">
                  <AvatarImage
                    src={project.owner.image ?? undefined}
                    alt={project.owner.name ?? "Owner avatar"}
                  />
                  <AvatarFallback>
                    {project.owner.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="truncate"
                  title={
                    project.owner.name || project.owner.username || undefined
                  }
                >
                  {project.owner.name || project.owner.username}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
