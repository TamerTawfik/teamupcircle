import React from "react";
import { getCollaborationStyle } from "@/app/actions/collab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Box, BriefcaseBusiness, GlobeLock } from "lucide-react";
import { EditCollabModal } from "./edit-collab";

interface CollabProps {
  userId: string;
  isProfileOwner: boolean;
}

// Helper function to format enum values
const formatEnumValue = (value: string | undefined | null): string => {
  if (!value) return "Not specified";
  return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export async function CollaborationStyleDisplay({
  userId,
  isProfileOwner,
}: CollabProps) {
  const collabStyle = await getCollaborationStyle(userId);

  if (!collabStyle) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-none">
        <CardHeader>
          <CardTitle>Collaboration Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">No collaboration preferences set yet.</p>
          <EditCollabModal>
            {isProfileOwner && (
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Set Preferences
              </Button>
            )}
          </EditCollabModal>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Collaboration Preferences</CardTitle>
        </div>
        <EditCollabModal>
          {isProfileOwner && (
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Preferences</span>
            </Button>
          )}
        </EditCollabModal>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-xs text-muted-foreground mb-1">
              Status
            </p>
            <Badge
              variant={
                collabStyle.availabilityStatus === "AVAILABLE"
                  ? "default"
                  : "secondary"
              }
              className="text-xs"
            >
              {collabStyle.availabilityStatus.replace("_", " ").toLowerCase()}
            </Badge>
          </div>
          <div>
            <p className="font-semibold text-xs text-muted-foreground mb-1">
              Hours per Week
            </p>
            <Badge
              variant="outline"
              className="bg-popover-foreground text-background"
            >
              {collabStyle.hoursPerWeek ?? "Not specified"}
            </Badge>
          </div>
          <div>
            <p className="font-semibold text-xs text-muted-foreground mb-1">
              Team Size
            </p>
            <Badge
              variant="outline"
              className="bg-popover-foreground text-background"
            >
              {formatEnumValue(collabStyle.teamSize)}
            </Badge>
          </div>
        </div>

        <div>
          <Badge
            variant="secondary"
            className="mb-2 bg-transparent text-muted-foreground"
          >
            <Box className="mr-2 h-4 w-4" /> Tech Stack
          </Badge>
          <div className="flex flex-wrap gap-2">
            {collabStyle.techs.length > 0 ? (
              collabStyle.techs.map((tech) => (
                <Badge
                  key={tech.id}
                  variant="outline"
                  className="bg-popover-foreground text-background"
                >
                  {tech.name}
                </Badge>
              ))
            ) : (
              <p className="ml-3 text-sm text-muted-foreground">
                No specific technologies listed.
              </p>
            )}
          </div>
        </div>

        <div>
          <Badge
            variant="secondary"
            className="mb-2 bg-transparent text-muted-foreground"
          >
            <GlobeLock className="mr-2 h-4 w-4" /> Project Domains
          </Badge>
          <div className="flex flex-wrap gap-2">
            {collabStyle.projectDomains.length > 0 ? (
              collabStyle.projectDomains.map((domain) => (
                <Badge
                  key={domain.id}
                  variant="outline"
                  className="bg-popover-foreground text-background"
                >
                  {domain.name}
                </Badge>
              ))
            ) : (
              <p className="ml-3 text-sm text-muted-foreground">
                No specific project domains listed.
              </p>
            )}
          </div>
        </div>

        <div>
          <Badge
            variant="secondary"
            className="mb-2 bg-transparent text-muted-foreground"
          >
            <BriefcaseBusiness className="mr-2 h-4 w-4" /> Team Roles
          </Badge>
          <div className="flex flex-wrap gap-2">
            {collabStyle.teamRoles.length > 0 ? (
              collabStyle.teamRoles.map((role) => (
                <Badge
                  key={role.id}
                  variant="outline"
                  className="bg-popover-foreground text-background"
                >
                  {role.name}
                </Badge>
              ))
            ) : (
              <p className="ml-3 text-sm text-muted-foreground">
                No specific team roles listed.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
