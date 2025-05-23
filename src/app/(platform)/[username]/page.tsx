import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGithubUser } from "@/lib/github";
import { ProfileInfo } from "@/components/profile/info";
import { RepositoryAnalysis } from "@/components/profile/repository-analysis";
import { Suspense } from "react";
import { getCurrentUser } from "@/app/actions/auth";
import { CollaborationStyleDisplay } from "@/components/profile/collab";
import { getConnectionStatus } from "@/app/actions/connections";
import { auth } from "@/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  try {
    const { username } = await params;
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

export default async function MemberProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const userProfile = await getCurrentUser({ username: username });
  const session = await auth();
  const isProfileOwner = session?.user?.id === userProfile?.id;
  const connection = await getConnectionStatus(username);

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
            <Suspense>
              <RepositoryAnalysis username={user.login} />
            </Suspense>
          </div>
          {userProfile && (
            <CollaborationStyleDisplay
              userId={userProfile.id}
              isProfileOwner={isProfileOwner}
            />
          )}
        </main>
      </div>
    </div>
  );
}
