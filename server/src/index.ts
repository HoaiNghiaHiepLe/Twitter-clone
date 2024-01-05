import express from 'express'
import userRouter from './routes/user.routes'
import DatabaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/media.routes'
import { initFolder } from './utils/file'

DatabaseService.connect()

const app = express()
const port = 4000

// create folder uploads
initFolder()
app.use(express.json())

app.use('/users', userRouter)
app.use('/medias', mediasRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})
