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
import conversationsRouter from './routes/conversations.routes'
import initSocket from './utils/socket'
// import fs from 'fs'
// import YAML from 'yaml'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

// test upload file to s3
// import '~/utils/s3'
// fake data
// import '~/utils/faker'

//Đọc file swagger.yaml và chuyển thành dạng json
// const swaggerFile = fs.readFileSync(path.resolve(__dirname, 'swagger/twitter-clone-swagger.yaml'), 'utf8')

// Dùng thư viện yaml để chuyển file
// const swaggerDocument = YAML.parse(swaggerFile)

//? Tạo swagger options bằng swaggerJSDoc
//? Cách này chỉ cần cài đặt swagger-jsdoc và swagger-ui-express
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    // Thông tin cơ bản của swagger
    openapi: '3.0.0',
    info: {
      title: 'Twitter Clone API',
      version: '1.0.0'
    },
    components: {
      // Định nghĩa security scheme ở đây hoặc ở từng route bằng cú pháp comment
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },

  apis: [
    // Đọc các file route để tạo swagger
    // './src/routes/*.routes.ts',
    // Đọc các file schema để tạo swagger
    // './src/models/schemas/*.schema.ts'
    //? Lấy trực tiếp từ tất cả file yaml trong thư mục swagger
    './src/swagger/*.yaml'
  ]
}

// Tạo swagger spec từ swagger options
const swaggerSpec = swaggerJSDoc(swaggerOptions)

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

// Dùng 1 trong 2 cách để khai báo swagger api docs route và ui
// Dùng yaml và swagger-ui-express tiện lợi hơn và dễ dàng hơn
// swagger api docs route and ui bằng swagger-ui-express và khai báo tất cả route test với swagger ở file yaml
// app.use(PATH.BASE.SWAGGER, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// swagger api docs route and ui bằng swaggerJSDoc và đọc từ swaggerOptions và khai báo swagger ở từng route
app.use(PATH.BASE.SWAGGER, swaggerUi.serve, swaggerUi.setup(swaggerSpec))

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

// init socket server
initSocket(httpServer)

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
