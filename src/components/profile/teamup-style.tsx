"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/profile/edit-profile";
import { ProfileWithCollaboration } from "@/types/profile";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { getLabel } from "@/lib/getLabel";
import techStack from "@/data/tech.json";
import projectDomains from "@/data/project-domains.json";
import roles from "@/data/roles.json";

interface TeamupStyleProps {
  user: ProfileWithCollaboration;
  isProfileOwner: boolean;
}

export function TeamupStyle({ user, isProfileOwner }: TeamupStyleProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-md">
              Teamup Preferences
            </CardTitle>
            <CardDescription className="text-sm">
              <div>
                {/* <label className="text-xs font-normal text-muted-foreground">
                  Status
                </label> */}
                <Badge
                  variant={
                    user.collaborationStyles?.availabilityStatus === "AVAILABLE"
                      ? "default"
                      : "secondary"
                  }
                  className="mt-1 ml-2 text-xs"
                >
                  {user.collaborationStyles?.availabilityStatus
                    ?.replace("_", " ")
                    .toLowerCase() || "Not specified"}
                </Badge>
              </div>
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {isProfileOwner && (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="outline"
                className="h-8 gap-1"
              >
                <Pencil className="h-3 w-3" />
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Edit
                </span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-3">
            <div className="font-semibold">Collaboration Style</div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground"> Hours per Week</dt>
                <dd>
                  {user.collaborationStyles?.hoursPerWeek || "Not specified"}{" "}
                  hours
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Preferred Team Size</dt>
                <dd>
                  {user.collaborationStyles?.teamSize?.replace(/_/g, " ") ||
                    "Not specified"}
                </dd>
              </div>
            </dl>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3">
            <div className="font-semibold">Technical Preferences</div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tech Stack
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.collaborationStyles?.techStack?.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {getLabel(tech, techStack)}
                  </Badge>
                )) || "Not specified"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Team Roles
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.collaborationStyles?.teamRoles?.map((role) => (
                  <Badge key={role} variant="secondary">
                    {getLabel(role, roles)}
                  </Badge>
                )) || "Not specified"}
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3">
            <div className="font-semibold">Project Domains</div>
            <div>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.collaborationStyles?.projectDomains?.map((type) => (
                  <Badge key={type} variant="secondary">
                    {getLabel(type, projectDomains)}
                  </Badge>
                )) || "Not specified"}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Updated{" "}
            <span>
              {formatDistance(
                new Date(user.collaborationStyles?.updatedAt || user.updatedAt),
                new Date(),
                {
                  addSuffix: true,
                }
              )}
            </span>
          </div>
        </CardFooter>
      </Card>

      <EditProfileDialog
        user={user}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </div>
  );
}
