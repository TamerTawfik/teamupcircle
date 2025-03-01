import { formatShortDateTime } from './utils';
import { MessageWithSenderRecipient } from '@/types/messages';


export function mapMessageToMessageDto(message: MessageWithSenderRecipient) {
    return {
        id: message.id,
        text: message.text,
        created: formatShortDateTime(message.created),
        dateRead: message.dateRead ? formatShortDateTime(message.dateRead) : null,
        senderId: message.sender?.userId,
        senderName: message.sender?.name,
        senderUsername: message.sender?.username,
        senderImage: message.sender?.image,
        recipientId: message.recipient?.userId,
        recipientImage: message.recipient?.image,
        recipientName: message.recipient?.name,
        recipientUsername: message.recipient?.username,
    }
}