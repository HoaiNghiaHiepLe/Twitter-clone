import express from 'express'
import userRoutes from './routes/user.routes'
import DatabaseService from './services/database.services'

const app = express()
const port = 3000
app.use(express.json())

app.post('/', (req, res) => {
  res.send('Hello World!')
})

DatabaseService.connect()

app.use('/users', userRoutes)

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})
