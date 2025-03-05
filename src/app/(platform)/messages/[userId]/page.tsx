import { MessageLayout } from "@/components/messages/message-layout";
import { MessageThread } from "@/components/messages/message-thread";
import { MessageSkeleton } from "@/components/messages/message-skeleton";
import { Suspense } from "react";

interface MessagePageProps {
  params: {
    userId: string;
  };
}

export default async function MessagePage({ params }: MessagePageProps) {
  const { userId } = await params;

  return (
    <MessageLayout>
      <Suspense fallback={<MessageSkeleton />}>
        <MessageThread userId={userId} />
      </Suspense>
    </MessageLayout>
  );
}
