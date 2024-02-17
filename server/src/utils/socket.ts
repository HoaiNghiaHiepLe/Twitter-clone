import { Server } from 'socket.io'
import { verifyAccessToken } from './common'
import { TokenPayload } from '~/models/requests/User.request'
import { UserVerifyStatus } from '~/constant/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { interpolateMessage } from './utils'
import { MESSAGE } from '~/constant/message'
import HTTP_STATUS from '~/constant/httpStatus'
import { ConversationPayload } from '~/types/common.type'
import Conversation from '~/models/schemas/Conversations.schema'
import conversationsService from '~/services/conversations.service'
import { IncomingMessage, ServerResponse } from 'http'
import { Server as ServerHttp } from 'http'

// Khởi tạo server để sử dụng socket.io
const initSocket = (httpServer: ServerHttp<typeof IncomingMessage, typeof ServerResponse>) => {
  // Khởi tạo instance io
  const io = new Server(httpServer, {
    /* options */
    // Cho phép client kết nối tới server
    cors: {
      // origin: domain của client
      // Ngoài domain này sẽ không cho phép kết nối khác đến server
      origin: process.env.CLIENT_URL
    }
  })

  // Middleware cho io server instance, chỉ chạy 1 lần khi có người dùng kết nối tới server
  io.use(async (socket, next) => {
    // Lấy ra access_token từ Authorization gửi từ client
    const { Authorization } = socket.handshake.auth
    // Lấy ra access_token từ Authorization bằng cách split chuỗi và lấy phần tử thứ 2
    const access_token = Authorization?.split(' ')[1]
    try {
      // verify access_token từ client gửi lên và lấy ra decoded_authorization
      const decoded_authorization = await verifyAccessToken(access_token)
      // Lấy ra verify từ decoded_authorization
      const { verify } = decoded_authorization as TokenPayload

      // Nếu verify không phải là Verified thì throw error
      if (verify !== UserVerifyStatus.Verified) {
        // Nếu user chưa verify thì không cho phép kết nối tới server và throw error và error nay sẽ được catch ở dưới
        throw new ErrorWithStatus({
          message: interpolateMessage(MESSAGE.UNVERIFIED, { field: 'Your account' }),
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      // Gán decoded_authorization vào socket.handshake.auth để sử dụng ở những bước tiếp theo
      socket.handshake.auth.decoded_authorization = decoded_authorization
      // Gán access_token vào socket.handshake.auth để sử dụng ở những bước tiếp theo
      socket.handshake.auth.access_token = access_token
      // Nếu đã verify thì gọi next() để cho phép kết nối tới server
      next()
    } catch (error) {
      // Nếu có lỗi thì không cho phép kết nối tới server và trả về lỗi
      // fn next của socket.io có kiểu error extends từ Error gốc, thêm property data nên phải truyền vào next đúng kiểu error
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  // khởi tạo object users bằng new Map()
  const users = new Map()

  // Lắng nghe sự kiện trên instance io
  io.on('connection', (socket) => {
    //socket là instance của client kết nối tới server nằm trong instance io
    // log khi có người dùng kết nối tới server
    console.log(`user ${socket.id} connected`)

    // Lấy user_id từ decoded_authorization gửi từ client đã được gán ở middleware ở trên
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload

    // set key của object users = user_id có value là object {socket_id: socket.id}
    // Khi có người dùng kết nối tới server thì sẽ lưu thông tin với key là user_id và value là object {socket_id: socket.id} vào object users
    users.set(user_id, { socket_id: socket.id })
    console.log('users', users)

    // Middleware cho socket khi emit 1 sự kiện chạy trước khi sự kiện đó được emit
    socket.use(async (packet, next) => {
      // Lấy ra access_token từ socket.handshake.auth
      const { access_token } = socket.handshake.auth
      try {
        // verify access_token
        await verifyAccessToken(access_token)
        // Nếu verify thành công thì gọi next() để emit sự kiện
        next()
      } catch (error) {
        // Nếu có lỗi thì next với error message là 'Unauthorized'
        next(new Error('Unauthorized'))
      }
    })

    // Lắng nghe sự kiện error
    socket.on('error', (error) => {
      // Nếu có lỗi là 'Unauthorized' thì ngắt kết nối socket
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    // Lắng nghe sự kiện send_message từ client
    //! Luồng xử lý của socket khi emit 1 sự kiện
    // khi socket 1 là của người gửi, emit 1 sự kiện bên client
    // Chỉ socket 1 bên server lắng nghe đuợc sự kiện này
    // Sau đó socket 1 bên server sẽ lấy được id của người nhận và message được gửi từ client và truyền message đó tới socket của người nhận
    socket.on('send_message', async (data) => {
      // Lấy ra sender_id, receiver_id, content từ data gửi từ client
      const { sender_id, receiver_id, content } = data.payload as ConversationPayload

      // Nếu data từ client không có sender_id, receiver_id hoặc content thì không gửi message
      if (!receiver_id || !sender_id || !content) return

      // Lấy ra socket_id của người nhận từ object users:
      // users[data.receiver_id].socket_id hoặc users.get(data.receiver_id).socket_id
      // Lấy data.receiver_id từ map users là user_id của người nhận thư đc gửi từ client khi emit sự kiện send_message
      const receiver_socket_id = users.get(receiver_id)?.socket_id

      // Vừa tạo conversation từ instance conversation trả ra cho client đồng thời lưu conversation vào database cũng bằng data đó nhưng không cần phải query lại từ database để trả về cho client
      const [conversation, result] = await Promise.all([
        // Tạo instance conversation để trả về cho client với data từ event send_message của client gửi lên bao gồm sender_id, receiver_id, content
        new Conversation({
          sender_id: sender_id,
          receiver_id: receiver_id,
          content: content
        }),

        // Lưu conversation vào database
        conversationsService.createConversation({
          sender_id: sender_id,
          receiver_id: receiver_id,
          content: content
        })
      ])

      // nếu k đủ dữ liệu để tạo conversation trong db thì return
      if (!result) return
      // Gán _id của conversation từ database vào instance conversation để trả về cho client
      conversation._id = result.insertedId

      // Đảm bảo răng nếu result, conversation tồn tại và receiver có kết nối  với socket server thì mới emit sự kiện
      if (result && conversation && receiver_socket_id) {
        // emit event receive_message để chuyển data tới người nhận bằng socket_id (khác user_id) với data là object {payload: conversation} chứa thông tin conversation vừa tạo ở trên
        socket.to(receiver_socket_id).emit('receive_message', { payload: conversation })
      }
    })

    // log khi có người dùng ngắt kết nối tới server
    socket.on('disconnect', () => {
      // Khi người dùng ngắt kết nối thì xóa thông tin của người dùng đó trong object users
      users.delete(user_id)
      console.log(`user ${socket.id} disconnected`)
      console.log(users)
    })
  })
}

export default initSocket
