import { MessageLayout } from "@/components/messages/message-layout";
import { MessageThread } from "@/components/messages/message-thread";
import { MessageSkeleton } from "@/components/messages/message-skeleton";
import { Suspense } from "react";

interface MessagePageProps {
  params: {
    userId: string;
  };
}

export default function MessagePage({ params }: MessagePageProps) {
  return (
    <MessageLayout>
      <Suspense fallback={<MessageSkeleton />}>
        <MessageThread userId={params.userId} />
      </Suspense>
    </MessageLayout>
  );
}
