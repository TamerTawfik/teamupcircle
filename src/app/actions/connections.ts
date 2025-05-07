"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ConnectionStatus, NotificationType } from "@prisma/client";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@teamupcircle.com';

const MAX_DAILY_REQUESTS = 50;
const REQUEST_WINDOW_HOURS = 24;

export async function getConnectionStatus(username: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    // First get the target user by username
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) return null;

    // Then get the connection status
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: session.user.id },
        ],
      },
    });

    return connection;
  } catch (error) {
    console.error("Error getting connection status:", error);
    return null;
  }
}

export async function sendConnectionRequest(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (targetUserId === session.user.id) {
    return { error: "Cannot connect with yourself" };
  }

  try {
    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: session.user.id },
        ],
      },
    });

    if (existingConnection) {
      if (existingConnection.status === ConnectionStatus.PENDING) {
        return { error: "Connection request already sent" };
      }
      if (existingConnection.status === ConnectionStatus.ACCEPTED) {
        return { error: "Already connected" };
      }
    }

    // Check rate limiting
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        lastConnectionRequest: true,
        connectionRequestCount: true,
        email: true,
        name: true,
        username: true,
      },
    });

    if (user) {
      const now = new Date();
      const resetTime = new Date(now.getTime() - REQUEST_WINDOW_HOURS * 60 * 60 * 1000);

      if (user.lastConnectionRequest && user.lastConnectionRequest > resetTime) {
        if (user.connectionRequestCount >= MAX_DAILY_REQUESTS) {
          return { error: "Daily connection request limit reached" };
        }
      }
    }

    // Check target user's privacy settings
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        privacySettings: {
          select: { autoDeclineRequests: true }
        },
      },
    });

    if (!targetUser || !targetUser.email) {
      return { error: "Target user not found or missing email" };
    }

    if (targetUser?.privacySettings?.autoDeclineRequests) {
      return { error: "User is not accepting connection requests at this time" };
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        senderId: session.user.id,
        receiverId: targetUserId,
        status: ConnectionStatus.PENDING,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: NotificationType.CONNECTION_REQUEST,
        message: `${session.user.name || session.user.username} sent you a connection request`,
        metadata: { connectionId: connection.id },
      },
    });

    // Send email notification for connection request
    if (resend && targetUser.email) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: targetUser.email,
          subject: "New Connection Request on TeamUpCircle",
          html: `<p>${session.user.name || session.user.username} sent you a connection request on TeamUpCircle.</p><p><a href="https://teamupcircle.com/connections/">View request</a></p>`,
        });
      } catch (emailError) {
        console.error("Resend - Error sending connection request email:", emailError);
        // Don't fail the whole operation, just log the email error
      }
    }

    // Update rate limiting counters
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastConnectionRequest: new Date(),
        connectionRequestCount: {
          increment: 1,
        },
      },
    });

    revalidatePath("/connections");
    return { success: true };
  } catch (error) {
    console.error("Error sending connection request:", error);
    return { error: "Failed to send connection request" };
  }
}

export async function respondToConnectionRequest(connectionId: string, accept: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      select: {
        id: true,
        receiverId: true,
        senderId: true,
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
          }
        }
      },
    });

    if (!connection) {
      return { error: "Connection request not found" };
    }

    if (connection.receiverId !== session.user.id) {
      return { error: "Not authorized" };
    }

    const status = accept ? ConnectionStatus.ACCEPTED : ConnectionStatus.DECLINED;
    
    await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    });

    // Create notification for the sender
    await prisma.notification.create({
      data: {
        userId: connection.senderId,
        type: accept ? NotificationType.CONNECTION_ACCEPTED : NotificationType.CONNECTION_DECLINED,
        message: `${session.user.name || session.user.username} ${accept ? "accepted" : "declined"} your connection request`,
        metadata: { connectionId },
      },
    });

    // Send email notification if accepted
    if (accept && resend && connection.sender.email) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: connection.sender.email,
          subject: "Your Connection Request was Accepted!",
          html: `<p>${session.user.name || session.user.username} accepted your connection request on TeamUpCircle.</p><p><a href="https://teamupcircle.com/connections/">View connections</a></p>`,
        });
      } catch (emailError) {
        console.error("Resend - Error sending connection accepted email:", emailError);
        // Don't fail the whole operation, just log the email error
      }
    }

    revalidatePath("/connections");
    return { success: true };
  } catch (error) {
    console.error("Error responding to connection request:", error);
    return { error: "Failed to respond to connection request" };
  }
}

export async function removeConnection(connectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: { sender: true, receiver: true },
    });

    if (!connection) {
      return { error: "Connection not found" };
    }

    if (connection.senderId !== session.user.id && connection.receiverId !== session.user.id) {
      return { error: "Not authorized" };
    }

    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.REMOVED },
    });

    // Notify the other user
    const otherUserId = connection.senderId === session.user.id 
      ? connection.receiverId 
      : connection.senderId;

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: NotificationType.CONNECTION_REMOVED,
        message: `${session.user.name || session.user.username} removed the connection`,
        metadata: { connectionId },
      },
    });

    revalidatePath("/connections");
    return { success: true };
  } catch (error) {
    console.error("Error removing connection:", error);
    return { error: "Failed to remove connection" };
  }
}

export async function getConnections(userId: string) {
  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
        status: ConnectionStatus.ACCEPTED,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            githubId: true,
            location: true,
            createdAt: true,
            collaborationStyles: {
              select: {
                id: true,
                availabilityStatus: true,
                hoursPerWeek: true,
                teamSize: true,
                updatedAt: true,
                teamRoles: true,
                techs: true,
                projectDomains: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            githubId: true,
            location: true,
            createdAt: true,
            collaborationStyles: {
              select: {
                id: true,
                availabilityStatus: true,
                hoursPerWeek: true,
                teamSize: true,
                updatedAt: true,
                teamRoles: true,
                techs: true,
                projectDomains: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return connections.map(conn => ({
      ...conn,
      otherUser: conn.senderId === userId ? conn.receiver : conn.sender,
    }));
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
}

export async function getPendingRequests() {
  const session = await auth();
  if (!session?.user?.id) return { sent: [], received: [] };

  try {
    const [sentRequests, receivedRequests] = await Promise.all([
      prisma.connection.findMany({
        where: {
          senderId: session.user.id,
          status: ConnectionStatus.PENDING,
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              collaborationStyles: true,
            },
          },
        },
      }),
      prisma.connection.findMany({
        where: {
          receiverId: session.user.id,
          status: ConnectionStatus.PENDING,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              collaborationStyles: true,
            },
          },
        },
      }),
    ]);

    return {
      sent: sentRequests,
      received: receivedRequests,
    };
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return { sent: [], received: [] };
  }
}

export async function getMutualConnections(userId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const [userConnections, targetConnections] = await Promise.all([
      getConnections(session.user.id),
      getConnections(userId),
    ]);

    const userConnectionIds = userConnections.map(conn => conn.otherUser.id);
    const targetConnectionIds = targetConnections.map(conn => conn.otherUser.id);

    const mutualIds = userConnectionIds.filter(id => targetConnectionIds.includes(id));

    return mutualIds;
  } catch (error) {
    console.error("Error fetching mutual connections:", error);
    return [];
  }
}

export async function bulkRespondToRequests(connectionIds: string[], accept: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const status = accept ? ConnectionStatus.ACCEPTED : ConnectionStatus.DECLINED;
    
    await prisma.$transaction(
      connectionIds.map(id =>
        prisma.connection.updateMany({
          where: {
            id,
            receiverId: session.user.id,
            status: ConnectionStatus.PENDING,
          },
          data: { status },
        })
      )
    );

    // Create notifications
    const connections = await prisma.connection.findMany({
      where: { id: { in: connectionIds } },
      include: { sender: true },
    });

    await prisma.notification.createMany({
      data: connections.map(conn => ({
        userId: conn.senderId,
        type: accept ? NotificationType.CONNECTION_ACCEPTED : NotificationType.CONNECTION_DECLINED,
        message: `${session.user.name || session.user.username} ${accept ? "accepted" : "declined"} your connection request`,
        metadata: { connectionId: conn.id },
      })),
    });

    revalidatePath("/connections");
    return { success: true };
  } catch (error) {
    console.error("Error processing bulk response:", error);
    return { error: "Failed to process requests" };
  }
}

// export async function updatePrivacySettings(settings: {
//   connectionRequests: string;
//   connectionListVisibility: string;
//   autoDeclineRequests: boolean;
//   notificationPreferences: Record<string, boolean>;
// }) {
//   const session = await auth();
//   if (!session?.user?.id) {
//     return { error: "Not authenticated" };
//   }

//   try {
//     await prisma.privacySettings.upsert({
//       where: { userId: session.user.id },
//       create: {
//         userId: session.user.id,
//         ...settings,
//       },
//       update: settings,
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error updating privacy settings:", error);
//     return { error: "Failed to update privacy settings" };
//   }
// }