import express from 'express'
import userRoutes from './user.routes'

const app = express()
const port = 3000

app.post('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/user', userRoutes)

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`)
})
