import { Suspense } from "react";
import { ConversationList } from "./conversation-list";
import { MessageSkeleton } from "./message-skeleton";

interface MessageLayoutProps {
  children: React.ReactNode;
}

export function MessageLayout({ children }: MessageLayoutProps) {
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
