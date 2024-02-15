import { ObjectId } from 'mongodb'
import Conversation, { ConversationConstructor } from '~/models/schemas/Conversations.schema'
import databaseService from '~/services/database.service'

export const insertOneConversation = async ({
  sender_id,
  receiver_id,
  content
}: Pick<ConversationConstructor, 'sender_id' | 'receiver_id' | 'content'>) => {
  // Tạo cuộc trò chuyện mới bằng sender_id, receiver_id và content được truyền vào
  const result = await databaseService.conversation.insertOne(
    new Conversation({
      sender_id,
      receiver_id,
      content
    })
  )
  return result
}

export const getConversationsBySenderIdAndReceiverId = async ({
  sender_id,
  receiver_id,
  limit,
  page
}: {
  sender_id: string
  receiver_id: string
  limit: number
  page: number
}) => {
  // Lấy thông tin cuộc trò chuyện dựa trên sender_id và receiver_id được truyền vào, trả về mảng các cuộc trò chuyện
  const match = {
    // Toán tử $or để lấy ra cuộc trò chuyện có sender_id và receiver_id hoặc receiver_id và sender_id
    // Vì khi lấy cuộc trò chuyện thì phải lấy cả tin nhắn của người gửi và cả tin nhắn của người nhận và ngược lại
    $or: [
      {
        //Option 1: Tìm cuộc trò chuyện có sender_id là sender_id và receiver_id là receiver_id
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id)
      },
      {
        //Option 2: Tìm cuộc trò chuyện có sender_id là receiver_id và receiver_id là sender_id
        sender_id: new ObjectId(receiver_id),
        receiver_id: new ObjectId(sender_id)
      }
    ]
  }

  // Dùng Promise.all để lấy ra cả cuộc trò chuyện và tổng số cuộc trò chuyện cùng 1 lúc vì 2 câu lệnh này không phụ thuộc vào nhau
  const [conversations, total] = await Promise.all([
    databaseService.conversation
      // Tìm cuộc trò chuyện dựa trên match
      .find(match)
      // Bỏ qua số lượng cuộc trò chuyện dựa trên limit và page, ví dụ limit = 10, page = 1 thì sẽ bỏ qua 0 cuộc trò chuyện, limit = 5, page = 2 thì sẽ bỏ qua 5 cuộc trò chuyện
      .skip(limit * (page - 1))
      // Giới hạn số lượng cuộc trò chuyện trả về
      .limit(limit)
      // Sắp xếp cuộc trò chuyện theo thời gian tạo mới nhất
      .sort({ created_at: -1 })
      // Chuyển kết quả từ cursor sang mảng
      .toArray(),
    // Đếm tổng số cuộc trò chuyện dựa trên match
    databaseService.conversation.countDocuments(match)
  ])

  // Trả về object chứa mảng cuộc trò chuyện và tổng số cuộc trò chuyện
  const result = {
    conversations,
    total
  }

  return result
}
