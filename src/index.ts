import express from 'express'
import userRoutes from './routes/user.routes'
import DatabaseService from './services/database.service'

const app = express()
const port = 3000
app.use(express.json())

app.post('/', (req, res) => {
  res.send('Hello World!')
})

DatabaseService.connect()

app.use('/user', userRoutes)

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})
