import { NextFunction, Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody, LogoutReqBody } from '~/models/requests/User.request'
import { USER_MESSAGE } from '~/constant/message'
import { interpolateMessage } from '~/utils/utils'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'

export const loginController = async (req: Request, res: Response) => {
  const { user } = req

  const user_id = ((user as User)._id as ObjectId).toString()

  const result = await userService.login(user_id)
  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'login' }),
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'register' }),
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body

  userService.logout(refresh_token)

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'logout' })
  })
}
