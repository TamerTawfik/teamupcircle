"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function setUsername(username: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const existing = await prisma.user.findUnique({
    where: { username }
  });

  if (existing) return { error: "Username already taken" };

  await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: { username }
  });

  return { success: true };
}