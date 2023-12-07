import { RegisterReqBody } from '~/models/requests/User.request'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constant/enum'
import {
  insertRefreshToken,
  insertUser,
  removeRefreshToken,
  updateEmailVerifyToken
} from '~/repository/users.repository'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'

config()
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()

    payload.user_id = user_id

    payload.email_verify_token = await this.signEmailVerifyToken(user_id.toString())

    await insertUser(payload)

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())

    insertRefreshToken(refresh_token, user_id.toString())

    console.log('email_verify_token', payload.email_verify_token)

    return {
      access_token,
      refresh_token,
      // tạm thời trả ra cho client để test khi chưa có mail server
      email_verify_token: payload.email_verify_token
    }
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    insertRefreshToken(refresh_token, user_id)
    return {
      access_token,
      refresh_token
    }
  }

  async logout(token: string) {
    return await removeRefreshToken(token)
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([this.signAccessAndRefreshToken(user_id), updateEmailVerifyToken(user_id)])

    const [access_token, refresh_token] = token

    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const emailVerifyToken = await this.signEmailVerifyToken(user_id)

    await updateEmailVerifyToken(user_id, emailVerifyToken)

    return {
      email_verify_token: emailVerifyToken
    }
  }
}

const userService = new UserService()
export default userService
