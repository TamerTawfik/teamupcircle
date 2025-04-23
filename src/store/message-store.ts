import { create } from 'zustand';
import { Message } from '@prisma/client'; 

export type MessageWithSender = Message & {
    sender: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    } | null;
    recipient?: { 
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    } | null;
};


export interface Conversation {
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    };
    lastMessage: MessageWithSender | null; 
    unreadCount: number;
}


interface MessageState {
    conversations: Conversation[];
    messages: MessageWithSender[];
    activeConversationId: string | null; 
    setConversations: (conversations: Conversation[]) => void;
    addMessage: (message: MessageWithSender) => void;
    setMessages: (messages: MessageWithSender[]) => void;
    setActiveConversationId: (userId: string | null) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    conversations: [],
    messages: [],
    activeConversationId: null,

    setConversations: (conversations) => set({ conversations }),

    addMessage: (newMessage) => {
        // --- Add Detailed Logging --- 
        const isSenderUpdate = newMessage.senderId !== get().activeConversationId; 
        console.log(
          `Store: addMessage called. Sender Local Update? ${isSenderUpdate}. Message ID: ${newMessage.id}`, 
          newMessage
        );
        // --- End Logging ---
        
        const state = get();
        let conversationUpdated = false;

        // Update messages list if it belongs to the active conversation
        if (
            state.activeConversationId &&
            (newMessage.senderId === state.activeConversationId || newMessage.recipientId === state.activeConversationId)
        ) {
            // --- Add Logging --- 
            console.log(`Store: Message ${newMessage.id} belongs to active conversation (${state.activeConversationId}).`);
            // --- End Logging ---
             
             // Prevent adding duplicates
            if (!state.messages.some(msg => msg.id === newMessage.id)) {
                 // --- Add Logging --- 
                 console.log(`Store: Adding message ${newMessage.id} to messages array.`);
                 // --- End Logging ---
                 set((prevState) => ({ messages: [...prevState.messages, newMessage] }));
            } else {
                // --- Add Logging --- 
                console.warn(`Store: Duplicate message detected (ID: ${newMessage.id}), not adding to messages array.`);
                // --- End Logging ---
            }
        } else {
             // --- Add Logging --- 
             console.warn(
                `Store: Message ${newMessage.id} does NOT belong to active conversation.`, 
                { 
                    activeId: state.activeConversationId, 
                    senderId: newMessage.senderId, 
                    recipientId: newMessage.recipientId 
                }
             ); 
             // --- End Logging ---
        }        

        // Update the conversations list
        let needsConversationUpdate = false;
        const updatedConversations = state.conversations.map(conv => {
            // Find the conversation this message belongs to (either sender or recipient is the partner)
            if (conv.user.id === newMessage.senderId || conv.user.id === newMessage.recipientId) {
                 // --- Add Logging --- 
                 console.log(`Store: Updating conversation list for user ${conv.user.id} due to message ${newMessage.id}.`);
                 // --- End Logging ---
                 conversationUpdated = true;
                 needsConversationUpdate = true;
                 return {
                    ...conv,
                    lastMessage: newMessage,
                    unreadCount: (newMessage.recipientId !== state.activeConversationId && conv.user.id === newMessage.senderId && state.activeConversationId !== newMessage.senderId) 
                                 ? conv.unreadCount + 1 // Increment if received by non-active user
                                 : 0 // Reset if active or if user sent it
                };
            }
            return conv;
        });

        if (!conversationUpdated) {
            // --- Add Logging --- 
            console.warn(`Store: Message ${newMessage.id} did not match any existing conversation for list update.`);
            // --- End Logging ---
        }

        if (needsConversationUpdate) {
             updatedConversations.sort((a, b) => {
                 if (!a.lastMessage) return 1;
                 if (!b.lastMessage) return -1;
                 return b.lastMessage.created.getTime() - a.lastMessage.created.getTime();
             });
             // --- Add Logging --- 
             console.log(`Store: Setting updated conversations list.`);
             // --- End Logging ---
             set({ conversations: updatedConversations });
        }
    },

    setMessages: (messages) => set({ messages }),

    setActiveConversationId: (userId) => {
        set(state => ({
            activeConversationId: userId,
            // Reset unread count for the newly activated conversation
            conversations: state.conversations.map(conv =>
                conv.user.id === userId ? { ...conv, unreadCount: 0 } : conv
            )
        }));
    },

})); 