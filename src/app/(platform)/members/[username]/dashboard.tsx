import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGithubUser } from "@/lib/github";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Users, GitFork, ExternalLink } from "lucide-react";
import { formatDistance } from "date-fns";

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const user = await getGithubUser(params.username);
    return {
      title: `${user.name || user.login} - Profile`,
      description: user.bio || `GitHub profile of ${user.login}`,
    };
  } catch {
    return {
      title: "Profile Not Found",
      description: "The requested GitHub profile could not be found.",
    };
  }
}

export default async function Dashboard({ params }: PageProps) {
  let user;

  try {
    user = await getGithubUser(params.username);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_url} alt={user.login} />
            <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{user.name || user.login}</h1>
            {user.name && (
              <p className="text-muted-foreground">@{user.login}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && <p className="text-muted-foreground">{user.bio}</p>}

          <div className="flex flex-wrap gap-4">
            {user.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined{" "}
                {formatDistance(new Date(user.created_at), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.followers}</span>
              <span className="text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.following}</span>
              <span className="text-muted-foreground">following</span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.public_repos}</span>
              <span className="text-muted-foreground">repositories</span>
            </div>
          </div>

          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View GitHub Profile
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
