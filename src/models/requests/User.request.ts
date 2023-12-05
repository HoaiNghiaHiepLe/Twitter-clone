import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constant/enum'

export type RegisterReqBody = {
  name?: string
  email: string
  date_of_birth?: string
  password: string
  confirm_password: string
}

export type TokenPayload = JwtPayload & {
  user_id: string
  token_type: TokenType
}

export interface LogoutReqBody {
  refresh_token: string
}
