import { RegisterReqBody } from '~/models/requests/User.request'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constant/enum'
import { insertRefreshToken, insertUser, removeRefreshToken } from '~/repository/users.repository'
import { config } from 'dotenv'

config()
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
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
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterReqBody) {
    const result = await insertUser(payload)

    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    insertRefreshToken(refresh_token, user_id)

    return {
      access_token,
      refresh_token
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
}

const userService = new UserService()
export default userService
