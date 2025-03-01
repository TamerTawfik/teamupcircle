import React from "react";
import ChatForm from "./chat-form";
import { getMessageThread } from "@/app/actions/messages";
import MessageBox from "./message-box";
import { getAuthUserId, getCurrentUser } from "@/app/actions/auth";

// the receiverId does't save in the database and fix the user can't chat to hisslef

export default async function ChatPage({
  params,
}: {
  params: { username: string };
}) {
  const targetUserId = await getCurrentUser({ username: params.username });
  if (!targetUserId) {
    return <div>User not found</div>;
  }
  const messages = await getMessageThread(targetUserId.id);
  const userId = await getAuthUserId();

  const body = (
    <div>
      {messages.length === 0 ? (
        "No messages to display"
      ) : (
        <div>
          {messages.map((message) => (
            <MessageBox
              key={message.id}
              message={message}
              currentUserId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2>Chat</h2>
      {body}
      <ChatForm />
    </div>
  );
}
