import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/user.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email !== 'hieple@mail.com' || password !== '123456') {
    return res.status(401).json({
      code: 401,
      message: 'Email or password is incorrect'
    })
  }

  res.json({ message: 'Login sucessful' })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await userService.register({ email, password })
    return res.json({
      message: 'register successful',
      result
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      error: 'Register failed'
    })
  }
}
