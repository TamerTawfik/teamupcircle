"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      collaborationStyles: true,
    },
  });

  return user;
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