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

  // Lắng nghe sự kiện private message từ client
  //! Luồng xử lý của socket khi emit 1 sự kiện
  // khi socket 1 là của người gửi, emit 1 sự kiện bên client
  // Chỉ socket 1 bên server lắng nghe đuợc sự kiện này
  // Sau đó socket 1 bên server sẽ lấy được id của người nhận và message được gửi từ client và truyền message đó tới socket của người nhận
  socket.on('private message', async (data) => {
    // Lấy ra socket_id của người nhận từ object users:
    // users[data.to].socket_id hoặc users.get(data.to).socket_id
    // data.to là user_id của người nhận được gửi từ client
    const receiver_socket_id = users.get(data.to)?.socket_id
    // Gửi message từ người gửi tới người nhận
    // với event là receive private message và data là object {content: data.content, from: user_id}
    // data.content là message được gửi từ client
    // user_id được lấy từ socket.auth._id và là user id của người gửi khi emit sự kiện private message từ client

    // Nếu data từ client không có from, to hoặc content thì không gửi message
    if (!data.from || !data.to || !data.content) return

    // Nếu người nhận không online thì không gửi message
    if (!receiver_socket_id) return

    // Lưu conversation vào database
    await insertOneConversation({
      sender_id: data.from,
      receiver_id: data.to,
      content: data.content
    })

    // emit sự kiện receive private message tới người nhận
    socket.to(receiver_socket_id).emit('receive private message', { content: data.content, from: user_id })
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
