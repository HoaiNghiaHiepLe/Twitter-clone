import { NextFunction, Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  RegisterReqBody,
  LogoutReqBody,
  TokenPayload,
  LoginReqBody,
  VerifyEmailReqBody,
  ForgotPasswordReqBody,
  ResetPasswordReqBody,
  UpdateMeReqBody,
  GetUserProfileParams,
  FollowReqBody,
  UnFollowReqParams
} from '~/models/requests/User.request'
import { USER_MESSAGE } from '~/constant/message'
import { interpolateMessage } from '~/utils/utils'
import User from '~/models/schemas/User.schema'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constant/httpStatus'
import { findUserById } from '~/repository/users.repository'
import { UserVerifyStatus } from '~/constant/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { pick } from 'lodash'

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

export const emailVerifyController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
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
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { user } = req as ForgotPasswordReqBody
  const user_id = ((user as User)._id as ObjectId).toString()
  const result = await userService.forgotPassword({ user_id, verify: (user as User).verify as UserVerifyStatus })

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SEND_EMAIL, { link: 'forgot password link' }),
    result
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
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

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = req.body as UpdateMeReqBody

  //? Lọc dữ liệu ngay tại controller, k tái sử dụng như middleware
  // const body = pick(req.body, [
  //   'name',
  //   'bio',
  //   'location',
  //   'website',
  //   'username',
  //   'avatar',
  //   'cover_photo',
  //   'date_of_birth'
  // ]) as UpdateMeReqBody

  const updatedUser = await userService.updateMe(user_id, body)

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'update user' }),
    result: updatedUser
  })
}

export const getUserInfoController = async (req: Request<GetUserProfileParams>, res: Response) => {
  const { username } = req.params

  const user = await userService.getUserInfo(username)

  if (!user) {
    throw new ErrorWithStatus({
      message: interpolateMessage(USER_MESSAGE.NOT_FOUND, { field: 'User' }),
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'Get user info' }),
    result: user
  })
}

export const followUserController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body as FollowReqBody

  const user = await userService.followUser(user_id, followed_user_id)

  if (!user) {
    throw new ErrorWithStatus({
      message: interpolateMessage(USER_MESSAGE.ALREADY, { field: 'User', work: 'follow' }),
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'follow user' })
  })
}

export const unfollowUserController = async (req: Request<UnFollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.params as UnFollowReqParams

  const result = await userService.unFollowUser(user_id, followed_user_id)

  if (!result) {
    throw new ErrorWithStatus({
      message: interpolateMessage(USER_MESSAGE.ALREADY, { field: 'User', work: 'unfollowed' }),
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  return res.json({
    message: interpolateMessage(USER_MESSAGE.SUCCESSFUL, { work: 'unfollow user' })
  })
}
