import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.request'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constant/enum'
import {
  findUserById,
  insertRefreshToken,
  insertUser,
  removeRefreshToken,
  resetUserPassword,
  verifyUser,
  updateForgotPasswordToken,
  updateUserProfile,
  findUserByUserName,
  insertFollower,
  findFollowerById
} from '~/repository/users.repository'
import { config } from 'dotenv'
import { ObjectId, UpdateResult, WithId } from 'mongodb'
import User from '~/models/schemas/User.schema'

config()
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }): Promise<[string, string]> {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  async register(
    payload: RegisterReqBody
  ): Promise<{ access_token: string; refresh_token: string; email_verify_token: string }> {
    const user_id = new ObjectId()

    payload.user_id = user_id

    payload.email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await insertUser(payload)

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    insertRefreshToken(refresh_token, user_id.toString())

    return {
      access_token,
      refresh_token,
      // tạm thời trả ra cho client để test khi chưa có mail server
      email_verify_token: payload.email_verify_token
    }
  }

  async login({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }): Promise<{ access_token: string; refresh_token: string }> {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    insertRefreshToken(refresh_token, user_id)
    return {
      access_token,
      refresh_token
    }
  }

  async logout(token: string) {
    return await removeRefreshToken(token)
  }

  async verifyEmail({ user_id }: { user_id: string }): Promise<{ access_token: string; refresh_token: string }> {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      verifyUser(user_id)
    ])

    const [access_token, refresh_token] = token

    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string): Promise<{ email_verify_token: string }> {
    const emailVerifyToken = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })

    await verifyUser(user_id, emailVerifyToken)

    return {
      email_verify_token: emailVerifyToken
    }
  }

  async forgotPassword({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }): Promise<{ forgot_password_token: string }> {
    const forgotPasswordToken = await this.signForgotPasswordToken({ user_id, verify })

    await updateForgotPasswordToken(user_id, forgotPasswordToken)

    return {
      forgot_password_token: forgotPasswordToken
    }
  }

  async resetPassword(user_id: string, password: string): Promise<UpdateResult<User>> {
    return await resetUserPassword(user_id, password)
  }

  async getMe(user_id: string): Promise<User | null> {
    const user = await findUserById(user_id, {
      password: 0,
      email_verify_token: 0,
      forgot_password_token: 0
    })
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody): Promise<WithId<User> | null> {
    const user = await updateUserProfile(user_id, payload)
    return user
  }

  async getUserInfo(username: string): Promise<User | null> {
    const user = await findUserByUserName(username, {
      password: 0,
      email_verify_token: 0,
      forgot_password_token: 0,
      verify: 0,
      created_at: 0,
      updated_at: 0
    })
    return user
  }

  async followUser(user_id: string, followed_user_id: string) {
    const followedUser = await findFollowerById(user_id, followed_user_id)

    if (followedUser) {
      return null
    }

    const result = await insertFollower(user_id, followed_user_id)

    return result
  }
}

const userService = new UserService()
export default userService
