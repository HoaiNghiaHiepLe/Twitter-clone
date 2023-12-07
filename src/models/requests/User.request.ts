import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constant/enum'
import User from '../schemas/User.schema'

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

export type verifyEmailReqBody = {
  email_verify_token: string
}
