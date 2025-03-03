import { getConversation } from "@/app/actions/messages";
import { MessageInput } from "./message-input";
import { MessageItem } from "./message-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MessageThreadProps {
  userId: string;
}

export async function MessageThread({ userId }: MessageThreadProps) {
  const { messages, error } = await getConversation(userId);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Get user info from the first message
  const otherUser =
    messages && messages.length > 0
      ? messages[0].senderId === userId
        ? messages[0].sender
        : messages[0].recipient
      : null;

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
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isSender={message.senderId !== userId}
            />
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <p className="text-center text-muted-foreground">
              No messages yet. Send a message to start the conversation!
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <MessageInput recipientId={userId} />
      </div>
    </div>
  );
}
