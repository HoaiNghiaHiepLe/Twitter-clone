import { Router } from 'express'
import { loginController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRoutes = Router()

usersRoutes.post('/login', loginValidator, loginController)

export default usersRoutes
