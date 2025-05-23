import { MessageLayout } from "@/components/messages/message-layout";
import { MessageThread } from "@/components/messages/message-thread";
import { MessageSkeleton } from "@/components/messages/message-skeleton";
import { Suspense } from "react";

export default async function MessagePage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;

  return (
    <MessageLayout>
      <Suspense fallback={<MessageSkeleton />}>
        <MessageThread userId={userId} />
      </Suspense>
    </MessageLayout>
  );
}
