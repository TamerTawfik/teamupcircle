"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUserAccount() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Delete all user data in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete all messages
      await tx.message.deleteMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { recipientId: session.user.id },
          ],
        },
      });

      // Delete all connections
      await tx.connection.deleteMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
      });

      // Delete all notifications
      await tx.notification.deleteMany({
        where: { userId: session.user.id },
      });

      // Delete privacy settings
      await tx.privacySettings.deleteMany({
        where: { userId: session.user.id },
      });

      // Delete collaboration styles
      await tx.collaborationStyle.deleteMany({
        where: { userId: session.user.id },
      });

      // Delete user accounts (OAuth)
      await tx.account.deleteMany({
        where: { userId: session.user.id },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: session.user.id },
      });
    });

    // Sign out the user
    await signOut({ redirect: false });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { error: "Failed to delete account" };
  }
}

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