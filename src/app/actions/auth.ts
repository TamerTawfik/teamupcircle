"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser({ username }: { username: string }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { username: username },
    include: {
      collaborationStyles: true,
    },
  });

  return user;
}

export async function getAuthUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('Unauthorized');

  return userId;
}

export async function updateGitHubInfo(userId: string, githubUsername: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: githubUsername,
      },
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating GitHub info:", error);
    return { error: "Failed to update GitHub information" };
  }
}