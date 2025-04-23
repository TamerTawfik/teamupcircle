"use client";

import { Suspense, useEffect, useRef } from "react";
import { ConversationList } from "./conversation-list";
import { MessageSkeleton } from "./message-skeleton";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import { useMessageStore, MessageWithSender } from "@/store/message-store";
import { Channel } from "pusher-js";

interface MessageLayoutProps {
  children: React.ReactNode;
}

export function MessageLayout({ children }: MessageLayoutProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { addMessage } = useMessageStore();
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!userId || !pusherClient) {
      return;
    }

    const channelName = `private-user-${userId}`;
    let channel =
      pusherClient.connection.state === "connected"
        ? pusherClient.subscribe(channelName)
        : null;

    if (!channel) {
      try {
        channel = pusherClient.subscribe(channelName);
        channelRef.current = channel; // Store channel in ref
      } catch (error) {
        console.error(
          `Failed to subscribe to Pusher channel ${channelName}:`,
          error
        );
        return; // Exit if subscription fails
      }
    } else {
      channelRef.current = channel; // Store existing channel in ref
    }

    const handleNewMessage = (message: MessageWithSender) => {
      console.log("Received new message via Pusher:", message);
      addMessage(message);
    };

    // Bind to the event
    channel.bind("new-message", handleNewMessage);

    const handleConnectionChange = (states: {
      current: string;
      previous: string;
    }) => {
      console.log("Pusher connection state changed:", states);
    };
    pusherClient.connection.bind("state_change", handleConnectionChange);

    // Cleanup function
    return () => {
      // Check if pusherClient exists before using it
      if (pusherClient && channelRef.current) {
        console.log(`Unsubscribing from ${channelRef.current.name}`);
        // Unbind all listeners for this channel before unsubscribing
        channelRef.current.unbind_all();
        pusherClient.unsubscribe(channelRef.current.name);
        channelRef.current = null;
      }
    };
  }, [userId, addMessage]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-4rem)]">
      <div className="md:col-span-1 border-r">
        <Suspense fallback={<MessageSkeleton />}>
          <ConversationList />
        </Suspense>
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}
