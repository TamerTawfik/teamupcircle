import {
  Calendar,
  MapPin,
  Users,
  GitFork,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { ConnectButton } from "@/components/connect-button";
import { auth } from "@/auth";
import { Connection } from "@prisma/client";

interface ProfileInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
  targetUserId?: string;
  connection: Connection | null;
}

export async function ProfileInfo({
  profile,
  targetUserId,
  connection,
}: ProfileInfoProps) {
  const session = await auth();
  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-6 mb-6">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={profile.avatar_url} alt={profile.login} />
          <AvatarFallback>
            {profile.bio
              .split(" ")
              .map((word: never[]) => word[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold">{profile.name || profile.login}</h1>
            {profile.name && (
              <p className="text-sm text-muted-foreground">@{profile.login}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmark
            </Button>
            {targetUserId !== session?.user.id && (
              <ConnectButton
                targetUserId={targetUserId || ""}
                connection={connection}
              />
            )}
          </div>
        </div>
        <div className="py-4">
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Joined GitHub{" "}
              {formatDistance(new Date(profile.created_at), new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{profile.followers}</span>
            <span className="text-muted-foreground">followers</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{profile.following}</span>
            <span className="text-muted-foreground">following</span>
          </div>
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{profile.public_repos}</span>

            <Link
              href={`https://github.com/${profile.login}?tab=repositories`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-muted-foreground hover:text-foreground">
                repositories <ExternalLink size={16} className="inline" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
