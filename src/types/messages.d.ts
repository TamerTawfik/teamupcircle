import { ZodIssue } from 'zod';

export type ActionResult<T> =
    { status: 'success', data: T } | { status: 'error', error: string | ZodIssue[] }

export type MessageDto = {
    id: string;
    text: string;
    created: string;
    dateRead: string | null;
    senderId?: string;
    senderName?: string;
    senderUsername?: string;
    senderImage?: string | null;
    recipientId?: string;
    recipientName?: string;
    recipientUsername?: string;
    recipientImage?: string | null
}

export type MessageWithSenderRecipient = Prisma.MessageGetPayload<{
    select: {
        id: true,
        text: true,
        created: true,
        dateRead: true,
        sender: {
            select: { id, name, username, image }
        },
        recipient: {
            select: { id, name, username, image }
        }
    }
}>