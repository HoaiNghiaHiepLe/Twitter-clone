import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/schemas/requests/User.request'

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

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.json({
    message: 'register successful',
    result
  })
}
