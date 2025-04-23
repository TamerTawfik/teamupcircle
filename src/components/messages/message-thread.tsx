"use client";

import { getConversation } from "@/app/actions/messages";
import { MessageInput } from "./message-input";
import { MessageItem } from "./message-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMessageStore, MessageWithSender } from "@/store/message-store";
import { useSession } from "next-auth/react";

type OtherUserInfo = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
} | null;

interface MessageThreadProps {
  userId: string; // This is the ID of the *other* user in the conversation
}

export function MessageThread({ userId }: MessageThreadProps) {
  // Remove unused activeConversationId
  const { messages, setMessages, setActiveConversationId } = useMessageStore();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use the simpler type for state
  const [otherUser, setOtherUser] = useState<OtherUserInfo>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Effect to set active conversation and fetch initial messages
  useEffect(() => {
    // Set this conversation as active in the store
    setActiveConversationId(userId);
    setIsLoading(true);
    setError(null);

    const fetchMessages = async () => {
      try {
        const result = await getConversation(userId);
        if (result.error) {
          setError(result.error);
          setMessages([]); // Clear messages on error
        } else if (result.messages) {
          const fetchedMessages = result.messages as MessageWithSender[];
          setMessages(fetchedMessages);

          // Determine and set the other user's info
          if (fetchedMessages.length > 0) {
            const firstMsg = fetchedMessages[0];
            // Ensure the extracted object matches OtherUserInfo
            const userInfo =
              firstMsg.senderId === userId
                ? firstMsg.sender
                : firstMsg.recipient;
            setOtherUser(
              userInfo
                ? {
                    id: userInfo.id,
                    name: userInfo.name,
                    username: userInfo.username,
                    image: userInfo.image,
                  }
                : null
            );
          } else {
            setOtherUser(null);
            console.warn(
              "No messages found, cannot determine other user info from messages."
            );
          }
        }
      } catch (err) {
        setError("Failed to load messages.");
        console.error(err);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId, setMessages, setActiveConversationId]);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Link href="/messages" className="mr-2 md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {otherUser ? (
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage
                src={otherUser.image || ""}
                alt={otherUser.name || ""}
              />
              <AvatarFallback>
                {otherUser.name?.charAt(0) ||
                  otherUser.username?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {otherUser.name || otherUser.username || "User"}
              </p>
              {otherUser.username && (
                <p className="text-xs text-muted-foreground">
                  @{otherUser.username}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="font-medium">New Conversation</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isSender={message.senderId === currentUserId}
            />
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <p className="text-center text-muted-foreground">
              No messages yet. Send a message to start the conversation!
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <MessageInput recipientId={userId} />
      </div>
    </div>
  );
}
