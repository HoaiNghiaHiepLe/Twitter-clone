import { ConversationConstructor } from '~/models/schemas/Conversations.schema'
import { getConversationsBySenderIdAndReceiverId, insertOneConversation } from '~/repository/conversations.repository'

class conversationService {
  async createConversation({
    sender_id,
    receiver_id,
    content
  }: Pick<ConversationConstructor, 'sender_id' | 'receiver_id' | 'content'>) {
    // Kiểm tra xem có đủ thông tin để tạo cuộc trò chuyện không
    if (!sender_id || !receiver_id || !content) return false
    // Gọi repository để tạo cuộc trò chuyện
    return await insertOneConversation({
      sender_id,
      receiver_id,
      content
    })
  }

  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    // Kiểm tra xem có đủ thông tin để lấy cuộc trò chuyện không
    if (!sender_id || !receiver_id) return false

    // Gọi repository để lấy cuộc trò chuyện
    const result = await getConversationsBySenderIdAndReceiverId({ sender_id, receiver_id, limit, page })

    return result
  }
}

export default new conversationService()
