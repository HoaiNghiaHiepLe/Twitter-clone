import express, { NextFunction, Request, Response } from 'express'
import userRoutes from './routes/user.routes'
import DatabaseService from './services/database.services'

const app = express()
const port = 3000
app.use(express.json())

app.use('/users', userRoutes)

DatabaseService.connect()

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    error: err.message
  })
})

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})
