import Link from "next/link";
import { getConversations } from "@/app/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

export async function ConversationList() {
  const { conversations, error } = await getConversations();

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 space-y-2">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
        <h3 className="font-medium">No messages yet</h3>
        <p className="text-sm text-muted-foreground text-center">
          Connect with other users to start a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
      <div className="overflow-y-auto flex-1">
        {conversations.map(({ user, lastMessage, unreadCount }) => (
          <Link
            key={user.id}
            href={`/messages/${user.id}`}
            className="flex items-center space-x-4 p-4 hover:bg-muted transition-colors border-b"
          >
            <Avatar>
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {user.name || user.username || "User"}
                </p>
                {lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lastMessage.created), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {lastMessage?.text || "Start a conversation"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="default" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
