import express from 'express'
import userRouter from './routes/user.routes'
import DatabaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import path from 'path'
import { DIR } from './constant/dir'
import { PATH } from './constant/path'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import databaseService from './services/database.services'

config()

DatabaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshToken()
  databaseService.indexVideoStatus()
  databaseService.indexFollower()
})

const app = express()
app.use(cors())

const port = process.env.PORT || 4000

// create folder uploads
initFolder()

app.use(express.json())
app.use(PATH.BASE.USERS, userRouter)
app.use(PATH.BASE.MEDIAS, mediasRouter)

// serve static file by router
app.use(PATH.BASE.STATIC, staticRouter)

//serve static video streaming by express
app.use(PATH.BASE.STATIC, express.static(path.resolve(DIR.UPLOAD_VIDEO_DIR)))

app.use(defaultErrorHandler)

app.listen(port, () => {
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
