import { MessageLayout } from "../message-layout";
import { MessageThread } from "../message-thread";
import { Suspense } from "react";
import { MessageSkeleton } from "../message-skeleton";

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
