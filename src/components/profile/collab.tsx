import React from "react";
import { getCollaborationStyle } from "@/app/actions/collab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
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
          <p>No collaboration preferences set yet.</p>
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
    <Card className="w-full max-w-2xl mx-auto border-none">
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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-normal text-sm text-muted-foreground">
              Availability
            </p>
            <p>
              {formatEnumValue(collabStyle.availabilityStatus).toLowerCase()}
            </p>
          </div>
          <div>
            <p className="font-normal text-sm text-muted-foreground">
              Hours per Week
            </p>
            <p>{collabStyle.hoursPerWeek ?? "Not specified"}</p>
          </div>
          <div>
            <p className="font-normal text-sm text-muted-foreground">
              Preferred Team Size
            </p>
            <p>{formatEnumValue(collabStyle.teamSize)}</p>
          </div>
        </div>

        <div>
          <p className="font-normal text-sm text-muted-foreground mb-2">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {collabStyle.techs.length > 0 ? (
              collabStyle.techs.map((tech) => (
                <Badge key={tech.id} variant="secondary">
                  {tech.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific technologies listed.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="font-normal text-sm text-muted-foreground mb-2">
            Project Domains
          </p>
          <div className="flex flex-wrap gap-2">
            {collabStyle.projectDomains.length > 0 ? (
              collabStyle.projectDomains.map((domain) => (
                <Badge key={domain.id} variant="secondary">
                  {domain.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific project domains listed.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="font-normal text-sm text-muted-foreground mb-2">
            Team Roles
          </p>
          <div className="flex flex-wrap gap-2">
            {collabStyle.teamRoles.length > 0 ? (
              collabStyle.teamRoles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific team roles listed.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
