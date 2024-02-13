import express from 'express'
import userRouter from './routes/users.routes'
import DatabaseService from './services/database.service'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import path from 'path'
import { DIR } from './constant/dir'
import { PATH } from './constant/path'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import databaseService from './services/database.service'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { insertOneConversation } from './repository/conversations.repository'
import conversationsRouter from './routes/conversations.routes'
import conversationsService from './services/conversations.service'
import Conversation from './models/schemas/Conversations.schema'
import { ConversationPayload } from './types/common.type'
// test upload file to s3
// import '~/utils/s3'
// fake data
// import '~/utils/faker'

config()

//connect với mongodb rồi chạy hàm tạo index cho các collection nếu chưa có
DatabaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexVideoStatus()
  databaseService.indexFollower()
  databaseService.indexTweet()
})

const app = express()
// Tạo server để sử dụng socket.io
const httpServer = createServer(app)
// enable cors
app.use(cors())

const port = process.env.PORT || 4000

// Hàm khởi tạo folder cho upload file nếu chưa có
initFolder()

// parse application/x-www-form-urlencoded
app.use(express.json())

// routers
app.use(PATH.BASE.USERS, userRouter)
app.use(PATH.BASE.MEDIAS, mediasRouter)
app.use(PATH.BASE.TWEETS, tweetsRouter)
app.use(PATH.BASE.BOOKMARKS, bookmarksRouter)
app.use(PATH.BASE.SEARCH, searchRouter)
app.use(PATH.BASE.CONVERSATIONS, conversationsRouter)

// serve static file by router
app.use(PATH.BASE.STATIC, staticRouter)

//serve static video streaming by express
app.use(PATH.BASE.STATIC, express.static(path.resolve(DIR.UPLOAD_VIDEO_DIR)))

// error handler global
app.use(defaultErrorHandler)

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

// khởi tạo object users bằng new Map()
const users = new Map()

// Lắng nghe sự kiện trên instance io
io.on('connection', (socket) => {
  //socket là instance của client kết nối tới server nằm trong instance io
  // log khi có người dùng kết nối tới server
  console.log(`user ${socket.id} connected`)

  // Lấy user_id là _id của từng user khi kết nối với server và truyền qua server từ client từ bằng socket.auth
  const user_id = socket.handshake.auth._id

  // set key của object users = user_id có value là object {socket_id: socket.id}
  // Khi có người dùng kết nối tới server thì sẽ lưu thông tin với key là user_id và value là object {socket_id: socket.id} vào object users
  users.set(user_id, { socket_id: socket.id })
  console.log('users', users)

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

    // Đảm bảo răng nếu result và conversation tồn tại thì mới emit sự kiện
    if (result && conversation) {
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

httpServer.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})

//? for test mongodb performance
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.juksne5.mongodb.net/?retryWrites=true&w=majority`
// const client = new MongoClient(uri)
// const db = client.db('MongodbPerformance')
// const users = db.collection('Users')
// const data = []
// for (let i = 0; i < 3000; i++) {
//   data.push({
//     name: `user${i}`,
//     age: Math.floor(Math.random() * 100) + 1,
//     bio: i % 2 === 0 ? 'male' : 'female'
//   })
// }

// users.insertMany(data)
