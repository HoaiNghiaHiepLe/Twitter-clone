import { Router } from 'express'

const userRoutes = Router()

userRoutes.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

userRoutes.get('/tweets', (req, res) => {
  res.json({
    data: [
      {
        id: '1',
        text: 'Hello World'
      }
    ]
  })
})

export default userRoutes
