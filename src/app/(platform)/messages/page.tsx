import { MessageLayout } from "@/components/messages/message-layout";

export default function MessagesPage() {
  return (
    <MessageLayout>
      <div className="flex h-full flex-col items-center justify-center p-4">
        <h3 className="text-xl font-medium">Select a conversation</h3>
        <p className="text-muted-foreground text-center mt-2">
          Choose a conversation from the sidebar or start a new one
        </p>
      </div>
    </MessageLayout>
  );
}
