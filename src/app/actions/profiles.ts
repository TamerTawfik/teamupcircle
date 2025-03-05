"use server";

import { prisma } from "@/lib/prisma";
import { getGitHubUserData } from "@/lib/github";
import { cache } from "react";
import { ProfileWithGitHub } from "@/types/profile";
import { auth } from "@/auth";

export const getProfiles = cache(async () => {
const session = await auth();
  // Get all users with their collaboration styles
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: session?.user?.id
      }
    },
    include: {
      collaborationStyles: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Only fetch GitHub data for users with missing information
  const profilesWithGitHub = await Promise.all(
    users.map(async (user): Promise<ProfileWithGitHub> => {
      // Check if we need to fetch GitHub data
      const needsGitHubData = !user.image || !user.location;
      
      if (user.username && needsGitHubData) {
        try {
          const githubData = await getGitHubUserData(user.username);
          
          // Update user in database with GitHub data if missing
          if (githubData) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                image: user.image || githubData.avatar_url,
                location: user.location || githubData.location,
              },
            });
          }

          return {
            ...user,
            image: user.image || githubData?.avatar_url,
            location: user.location || githubData?.location,
            githubData,
          };
        } catch (error) {
          console.error(`Failed to fetch GitHub data for ${user.username}:`, error);
          return user;
        }
      }
      return user;
    })
  );

  return profilesWithGitHub;
});