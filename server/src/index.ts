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

config()

DatabaseService.connect()

const app = express()
const port = process.env.PORT || 4000

// create folder uploads
initFolder()

app.use(express.json())
app.use(PATH.BASE.USERS, userRouter)
app.use(PATH.BASE.MEDIAS, mediasRouter)

// serve static file by router
app.use(PATH.BASE.STATIC, staticRouter)

//serve static file by express
app.use(PATH.BASE.STATIC, express.static(path.resolve(DIR.UPLOAD_VIDEO_DIR)))

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})
