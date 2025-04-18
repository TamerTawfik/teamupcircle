import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileWithGitHub } from "@/types/profile";
import { MapPin, Users, Clock } from "lucide-react";
import roles from "@/data/roles.json";
import { getLabel } from "@/lib/getLabel";

export function ProfileCard({ profile }: { profile: ProfileWithGitHub }) {
  return (
    <Card
      className="hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
      onClick={() => (window.location.href = `/${profile.username}`)}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
          <AvatarFallback>
            {profile.name?.[0] || profile.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">
            {profile.name || profile.username}
          </h3>
          {profile.location && (
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {profile.location}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {profile.collaborationStyles && (
          <div className="space-y-3">
            {profile.collaborationStyles.teamRoles.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {profile.collaborationStyles.teamRoles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {getLabel(role.name, roles)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.collaborationStyles.availabilityStatus && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant={
                    profile.collaborationStyles.availabilityStatus ===
                    "AVAILABLE"
                      ? "default"
                      : "secondary"
                  }
                >
                  {profile.collaborationStyles.availabilityStatus
                    .replace("_", " ")
                    .toLowerCase()}
                </Badge>
                {profile.collaborationStyles.hoursPerWeek && (
                  <span className="text-sm text-muted-foreground">
                    · {profile.collaborationStyles.hoursPerWeek}h/week
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <span className="pr-1">Updated </span>
        <span>
          {formatDistance(
            new Date(
              profile.collaborationStyles?.updatedAt || profile.createdAt
            ),
            new Date(),
            {
              addSuffix: true,
            }
          )}
        </span>
      </CardFooter>
    </Card>
  );
}
