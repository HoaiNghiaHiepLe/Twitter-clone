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

// Lắng nghe sự kiện trên instance io
io.on('connection', (socket) => {
  //socket là instance của client kết nối tới server nằm trong instance io
  // log khi có người dùng kết nối tới server
  console.log(`user ${socket.id} connected`)
  // log khi có người dùng ngắt kết nối tới server
  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`)
  })
  // Lắng nghe sự kiện chat từ client
  socket.on('chat', (message) => {
    // Nhận message từ client và log ra console
    console.log(message)
  })

  // Gửi message từ server tới client
  socket.emit('hello', { message: `hello user ${socket.id} from server` })
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
