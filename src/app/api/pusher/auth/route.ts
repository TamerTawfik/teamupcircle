import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await request.formData();
  const socketId = data.get("socket_id") as string;
  const channel = data.get("channel_name") as string;

  // Basic validation
  if (!socketId || !channel) {
      return new NextResponse("Bad Request", { status: 400 });
  }

  // For private channels like 'private-user-{userId}', authorize if the channel name matches the logged-in user's ID.
  const userId = session.user.id;
  const expectedChannelPrefix = `private-user-`;

  // Allow subscription if the channel is the user's private channel
  if (!channel.startsWith(expectedChannelPrefix) || channel !== `private-user-${userId}`) {
      console.warn(`Auth attempt failed: User ${userId} tried to access forbidden channel ${channel}`);
      return new NextResponse("Forbidden", { status: 403 });
  }

  const userData = {
    user_id: userId,
    
  };

  try {
    const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);
    return NextResponse.json(authResponse);
  } catch (error) {
      console.error("Pusher auth error:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
  }
} 