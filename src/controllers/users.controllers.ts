import { NextFunction, Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  RegisterReqBody,
  LogoutReqBody,
  TokenPayload,
  LoginReqBody,
  verifyEmailReqBody,
  forgotPasswordReqBody,
  resetPasswordReqBody,
  updateMeReqBody
} from '~/models/requests/User.request'
import { USER_MESSAGE } from '~/constant/message'
import { interpolateMessage } from '~/utils/utils'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constant/httpStatus'
import { findUserById } from '~/repository/users.repository'
import { UserVerifyStatus } from '~/constant/enum'
import { ErrorWithStatus } from '~/models/Errors'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const { user } = req as LoginReqBody

  const user_id = ((user as User)._id as ObjectId).toString()
  const verify = (user as User).verify as UserVerifyStatus

  const result = await userService.login({ user_id, verify })
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
  const result = await userService.register(req.body as RegisterReqBody)
  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'register' }),
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body as LogoutReqBody

  userService.logout(refresh_token)

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'logout' })
  })
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, verifyEmailReqBody>, res: Response) => {
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

  const result = await userService.verifyEmail({ user_id })

  // verify email success
  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'email verify' }),
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await findUserById(user_id)

  // not found
  if (!user) {
    return res.json({
      message: interpolateMessage(USER_MESSAGE.NOT_FOUND, { field: 'User' }),
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: interpolateMessage(USER_MESSAGE.ALREADY, { field: 'email', work: 'verified' }),
      status: HTTP_STATUS.OK
    })
  }

  const result = await userService.resendVerifyEmail(user_id)

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'resend verify email' }),
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response
) => {
  const { user } = req as forgotPasswordReqBody
  const user_id = ((user as User)._id as ObjectId).toString()
  const result = await userService.forgotPassword({ user_id, verify: (user as User).verify as UserVerifyStatus })

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SEND_EMAIL, { link: 'forgot password link' }),
    result
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordReqBody>,
  res: Response
) => {
  const { user_id, exp } = req.decoded_forgot_password_token as TokenPayload
  const { forgot_password_token, password } = req.body

  const user = await findUserById(user_id)

  // not found
  if (!user) {
    return res.json({
      message: interpolateMessage(USER_MESSAGE.NOT_FOUND, { field: 'User' }),
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  if (user.forgot_password_token !== forgot_password_token) {
    throw new ErrorWithStatus({
      message: interpolateMessage(USER_MESSAGE.INVALID, { field: 'forgot password token' }),
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  const currentTime = Math.floor(Date.now() / 1000)

  if ((exp as number) < currentTime) {
    throw new ErrorWithStatus({
      message: interpolateMessage(USER_MESSAGE.EXPIRED, { field: 'forgot password token' }),
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  await userService.resetPassword(user_id, password)

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'Reset password' })
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getMe(user_id)
  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'Get me' }),
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, updateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = req.body as updateMeReqBody

  const updatedUser = await userService.updateMe(user_id, body)

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'update user' }),
    result: updatedUser
  })
}
