import express from 'express'
import userRoutes from './routes/user.routes'
import DatabaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

DatabaseService.connect()

const app = express()
const port = 3000

app.use(express.json())

app.use('/users', userRoutes)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})
