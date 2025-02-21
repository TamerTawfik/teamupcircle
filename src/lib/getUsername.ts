"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getUsername(userId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      collaborationStyles: true,
    },
  });

  return user;
}