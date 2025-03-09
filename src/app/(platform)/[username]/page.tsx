import * as React from "react";
import { Inbox } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGithubUser } from "@/lib/github";
import { ProfileInfo } from "@/components/profile/info";
import {
  TechStack,
  TechStackError,
  TechStackSkeleton,
} from "@/components/profile/tech-stack";
import { Suspense } from "react";
import { getCurrentUser } from "@/app/actions/auth";
import { getTechStack } from "@/lib/tech-stack";
import { TeamupStyle } from "@/components/profile/teamup-style";
import { getConnectionStatus } from "@/app/actions/connections";
import { auth } from "@/auth";

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { username } = params;
    const user = await getGithubUser(username);
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

async function TechStackSection({ username }: { username: string }) {
  try {
    const data = await getTechStack(username);
    return <TechStack username={username} initialData={data} />;
  } catch (error) {
    return (
      <TechStackError
        error={error instanceof Error ? error : new Error("Unknown error")}
      />
    );
  }
}

export default async function MemberProfile({ params }: PageProps) {
const { username } = params;
  const userProfile = await getCurrentUser({ username: username });
  const session = await auth();
  const isProfileOwner = session?.user?.id === userProfile?.id;
  const connection = await getConnectionStatus(username);

  if (!userProfile) {
    return notFound();
  }

  let user;

  try {
    user = await getGithubUser(username);
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-4 sm:py-0 md:gap-4 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-4 lg:col-span-2">
            <ProfileInfo
              profile={user}
              targetUserId={userProfile?.id}
              connection={connection}
            />
            <Suspense fallback={<TechStackSkeleton />}>
              <TechStackSection username={user.login} />
            </Suspense>
            <Card>
              <CardHeader className="px-7">
                <CardTitle>Projects</CardTitle>
                <CardDescription>Discover recent Projects.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center flex-col space-y-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <Inbox size={18} />
                  </div>
                  <p className="text-[#606060] text-sm">
                    The project section is under construction.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          {userProfile && (
            <TeamupStyle user={userProfile} isProfileOwner={isProfileOwner} />
          )}
        </main>
      </div>
    </div>
  );
}
