import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constant/enum'
import User from '../schemas/User.schema'

export type UpdateMeReqBody = Pick<
  User,
  'name' | 'bio' | 'location' | 'website' | 'username' | 'avatar' | 'cover_photo'
> & {
  date_of_birth?: string
}

export type LoginReqBody = {
  user: User
}

export type RegisterReqBody = {
  user_id?: ObjectId
  name?: string
  email: string
  date_of_birth?: string
  password: string
  confirm_password: string
  email_verify_token?: string
}

export type TokenPayload = JwtPayload & {
  user_id: string
  token_type: TokenType
}

export interface LogoutReqBody {
  refresh_token: string
}

export type VerifyEmailReqBody = {
  email_verify_token: string
}

export type GetUserProfileParams = {
  username: string
}

export type ForgotPasswordReqBody = {
  user: User
}
export type ResetPasswordReqBody = {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export type FollowReqBody = {
  followed_user_id: string
}

export type UnFollowReqParams = {
  followed_user_id: string
}
