'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { z } from 'zod'
import { pusherServer } from "@/lib/pusher";
import { Message } from '@prisma/client';

// Validation schema for sending messages
const SendMessageSchema = z.object({
  text: z.string().min(1).max(280),
  recipientId: z.string().min(1)
})

// Define a type for the message with sender details for Pusher payload
type MessageWithSender = Message & {
    sender: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    } | null; // Sender might be null if relation is optional or not included
};

// Types for message operations
export type SendMessageFormData = z.infer<typeof SendMessageSchema>

// Function to send a new message
export async function sendMessage(data: SendMessageFormData) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        error: 'You must be logged in to send messages'
      }
    }
    
    const validation = SendMessageSchema.safeParse(data)
    
    if (!validation.success) {
      return {
        error: 'Invalid message data'
      }
    }
    
    // Check if sender and recipient exist
    const recipient = await prisma.user.findUnique({
      where: { id: data.recipientId }
    })
    
    if (!recipient) {
      return {
        error: 'Recipient not found'
      }
    }
    
    // Check if there's a connection between users
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: data.recipientId,
            status: 'ACCEPTED'
          },
          {
            senderId: data.recipientId,
            receiverId: session.user.id,
            status: 'ACCEPTED'
          }
        ]
      }
    })
    
    if (!connection) {
      return {
        error: 'You can only message users you are connected with'
      }
    }
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        text: data.text,
        senderId: session.user.id,
        recipientId: data.recipientId
      }
    })

    // Include sender details for the Pusher payload
    const messageWithSender: MessageWithSender | null = await prisma.message.findUnique({
        where: { id: message.id },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                }
            }
        }
    });

    if (!messageWithSender) {
      // Handle case where the message couldn't be refetched (should be rare)
      console.error("Failed to fetch message with sender details after creation:", message.id);
      // Decide if you still want to proceed without pusher or return an error
    } else {
       // Trigger Pusher event for the recipient
      try {
        await pusherServer.trigger(
          `private-user-${data.recipientId}`, // Target recipient's private channel
          'new-message', // Event name
          messageWithSender // Send the full message data with sender info
        );
      } catch (pusherError) {
        console.error("Failed to trigger Pusher event:", pusherError);
        
      }
    }

    revalidatePath('/messages')
    return { success: true, message: messageWithSender ?? message } // Return the enriched message if available
  } catch (error) {
    console.error('Error sending message:', error)
    return {
      error: 'Failed to send message'
    }
  }
}

// Function to get messages between current user and another user
export async function getConversation(otherUserId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        error: 'You must be logged in to view messages'
      }
    }
    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            recipientId: otherUserId,
            senderDeleted: false
          },
          {
            senderId: otherUserId,
            recipientId: session.user.id,
            recipientDeleted: false
          }
        ]
      },
      orderBy: {
        created: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })
    
    // Mark unread messages as read
    const unreadMessages = messages.filter(
      message => 
        message.senderId === otherUserId && 
        message.recipientId === session.user.id && 
        !message.dateRead
    )
    
    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: unreadMessages.map(message => message.id)
          }
        },
        data: {
          dateRead: new Date()
        }
      })
      
      
      
      revalidatePath('/messages')
    }
    
    return { success: true, messages }
  } catch (error) {
    console.error('Error getting conversation:', error)
    return {
      error: 'Failed to load messages'
    }
  }
}

// Get all conversations for the current user
export async function getConversations() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        error: 'You must be logged in to view messages'
      }
    }
    
    // Find all users the current user has exchanged messages with
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            senderMessages: {
              some: {
                recipientId: session.user.id,
                recipientDeleted: false
              }
            }
          },
          {
            recipientMessages: {
              some: {
                senderId: session.user.id,
                senderDeleted: false
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true
      }
    })
    
    // Get the most recent message and unread count for each user
    const conversations = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              {
                senderId: session.user.id,
                recipientId: user.id,
                senderDeleted: false
              },
              {
                senderId: user.id,
                recipientId: session.user.id,
                recipientDeleted: false
              }
            ]
          },
          orderBy: {
            created: 'desc'
          }
        })
        
        // Include sender details in the last message for the conversation list
        const lastMessageWithSender = lastMessage ? await prisma.message.findUnique({
            where: { id: lastMessage.id },
            include: {
                sender: {
                    select: { id: true, name: true, username: true, image: true }
                }
            }
        }) : null;

        const unreadCount = await prisma.message.count({
          where: {
            senderId: user.id,
            recipientId: session.user.id,
            dateRead: null,
            recipientDeleted: false
          }
        })
        
        return {
          user,
          lastMessage: lastMessageWithSender, 
          unreadCount
        }
      })
    )
    
    // Sort conversations by most recent message
    const sortedConversations = conversations.sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return 0
      
      return (b.lastMessage as Message).created.getTime() - (a.lastMessage as Message).created.getTime()
    })
    
    return { success: true, conversations: sortedConversations }
  } catch (error) {
    console.error('Error getting conversations:', error)
    return {
      error: 'Failed to load conversations'
    }
  }
}

// Delete a message
export async function deleteMessage(messageId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        error: 'You must be logged in to delete messages'
      }
    }
    
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })
    
    if (!message) {
      return {
        error: 'Message not found'
      }
    }
    
    // Check if user is sender or recipient
    if (message.senderId !== session.user.id && message.recipientId !== session.user.id) {
      return {
        error: 'You can only delete your own messages'
      }
    }
    
    // If user is sender, mark as sender deleted
    if (message.senderId === session.user.id) {
      await prisma.message.update({
        where: { id: messageId },
        data: { senderDeleted: true }
      })
    }
    
    // If user is recipient, mark as recipient deleted
    if (message.recipientId === session.user.id) {
      await prisma.message.update({
        where: { id: messageId },
        data: { recipientDeleted: true }
      })
    }
    
    // If both sender and recipient have deleted, physically remove the message
    if (
      (message.senderId === session.user.id && message.recipientDeleted) ||
      (message.recipientId === session.user.id && message.senderDeleted)
    ) {
      await prisma.message.delete({
        where: { id: messageId }
      })
    }
    

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return {
      error: 'Failed to delete message'
    }
  }
}