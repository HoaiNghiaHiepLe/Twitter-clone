import Conversation, { ConversationConstructor } from '~/models/schemas/Conversations.schema'
import databaseService from '~/services/database.service'

export const insertOneConversation = async ({
  sender_id,
  receiver_id,
  content
}: Pick<ConversationConstructor, 'sender_id' | 'receiver_id' | 'content'>) => {
  if (!sender_id || !receiver_id || !content) throw new Error('sender_id, receiver_id and content are required')

  const result = await databaseService.conversation.insertOne(
    new Conversation({
      sender_id,
      receiver_id,
      content
    })
  )
  return result
}
