import { NextFunction, Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody, LogoutReqBody, TokenPayload } from '~/models/requests/User.request'
import { USER_MESSAGE } from '~/constant/message'
import { interpolateMessage } from '~/utils/utils'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constant/httpStatus'
import { findUserById } from '~/repository/users.repository'

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

export const emailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await findUserById(user_id)

  // not found
  if (!user) {
    return res.json({
      message: interpolateMessage(USER_MESSAGE.NOT_FOUND, { field: 'User' }),
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  // already verified
  if (user.email_verify_token === '') {
    return res.json({
      message: interpolateMessage(USER_MESSAGE.ALREADY, { field: 'email', work: 'verified' }),
      status: HTTP_STATUS.OK
    })
  }

  const result = await userService.verifyEmail(user_id)

  // verify email success
  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'email verify' }),
    result
  })
}
