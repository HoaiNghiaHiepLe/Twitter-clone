import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { MESSAGE } from '~/constant/message'
import { GetConversationParam } from '~/models/requests/Conversation.request'
import { TokenPayload } from '~/models/requests/User.request'
import conversationService from '~/services/conversations.service'
import { interpolateMessage } from '~/utils/utils'

export const getConversationsController = async (req: Request<GetConversationParam>, res: Response) => {
  // Lấy thông tin người nhận tin nhắn từ params
  const receiver_id = String(req.params.receiver_id)
  // Lấy thông tin limit và page từ query
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  // Lấy thông tin người gửi tin nhắn từ token user đang login
  const { user_id: sender_id } = req.decoded_authorization as TokenPayload

  // Gọi service để lấy thông tin cuộc trò chuyện
  const result = await conversationService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })

  // Nếu không có cuộc trò chuyện nào thì trả về thông báo không tìm thấy
  if (!result) {
    return res.json({
      message: interpolateMessage(MESSAGE.NOT_FOUND, { field: 'Conversations' })
    })
  }
  // Trả về thông tin cuộc trò chuyện
  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Get conversation' }),
    result: {
      conversations: result.conversations,
      page,
      limit,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
