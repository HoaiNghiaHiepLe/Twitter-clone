import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRoutes = Router()

usersRoutes.post('/login', loginValidator, loginController)
usersRoutes.post('/register', registerController)

export default usersRoutes
