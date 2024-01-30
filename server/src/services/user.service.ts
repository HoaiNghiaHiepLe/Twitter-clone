import { RegisterReqBody, TokenPayload, UpdateMeReqBody } from '~/models/requests/User.request'
import { signToken, verifyToken } from '~/utils/jwt'
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
  findFollowerById,
  deleteFollower,
  changeUserPassword,
  checkExistEmail,
  getFollowedUsersByUserId
} from '~/repository/users.repository'
import { config } from 'dotenv'
import { DeleteResult, Document, ObjectId, UpdateResult, WithId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import axios from 'axios'
import { hashPassword } from '~/utils/crypto'
import { googleOAuthPayload, googleOAuthToken } from '~/types/OpenAuth.type'
import Follower from '~/models/schemas/Follower.schema'
import { sendVerifyEmail } from '~/utils/email'

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

  private signRefreshToken({
    user_id,
    verify,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    exp?: number
  }): Promise<string> {
    if (exp) {
      //? nếu có truyền exp thì sign với exp (dùng cho trường hợp refresh token exp bằng exp của refresh token cũ)
      //? Để bảo mật hơn sẽ có trường hợp gọi đến hàm refresh Token khi refresh token cũ đã hết hạn nó sẽ tạo ra 1 refresh token mới với exp cũng hết hạn
      //? User sẽ phải login lại để lấy refresh token mới
      //? Hoặc thuận tiện hơn cho user nhưng ít bảo mật hơn thì có thể check nếu exp && exp < Date.now() thì mới truyền exp vào payload để signToken
      //? Lúc này nếu refresh token cũ hết hạn thì sẽ tạo ra 1 refresh token mới với expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      //? Vì vậy khi refresh token bị lộ attacker vẫn có thể dùng refresh token cũ để tiếp tục lấy refresh token mới
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify: verify,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    //? nếu không truyền exp thì sign với expiresIn (dùng cho trường hợp refresh token lấy exp mặc định từ env)
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

  private decodeRefreshToken(refresh_token: string): Promise<TokenPayload> {
    return verifyToken({ token: refresh_token, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string })
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
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    insertRefreshToken(refresh_token, user_id.toString(), iat, exp)

    await sendVerifyEmail(
      payload.email,
      'Verify Email',
      `<a href="${process.env.CLIENT_URL}/verify-email?token=${payload.email_verify_token}">Click here to verify your email</a>`
    )

    return {
      access_token,
      refresh_token,
      // Trả ra cho client để test khi chưa có mail server
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
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    insertRefreshToken(refresh_token, user_id, iat, exp)
    return {
      access_token,
      refresh_token
    }
  }

  private async getOAuthGoogleToken(code: string): Promise<googleOAuthToken> {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data
  }

  private async getOAuthGoogleUserInfo(access_token: string, id_token: string): Promise<googleOAuthPayload> {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })

    return data
  }

  async oAuth(code: string) {
    // 1. Ở Client config google auth login bằng google
    // 2. Request lên google và lấy code
    const { id_token, access_token } = await this.getOAuthGoogleToken(code)
    // 3. Lấy thông tin user từ google bằng code vừa lấy được
    const userInfo = await this.getOAuthGoogleUserInfo(access_token, id_token)
    // 4. Nếu email chưa được xác thực thì trả về null
    if (!userInfo.verified_email) {
      return null
    }
    // 5. Kiểm tra xem email đã được đăng ký chưa
    const user = await checkExistEmail(userInfo.email)
    // 6. Nếu đã đăng ký thì trả về access_token và refresh_token
    if (user) {
      const user_id = user._id.toString()
      const verify = user.verify as UserVerifyStatus

      const result = await this.login({ user_id, verify })

      return { ...result, new_user: 0, verify: verify }
    } else {
      // 7. Nếu chưa đăng ký thì đăng ký và trả về access_token và refresh_token
      const payload: Omit<RegisterReqBody, 'confirm_password'> = {
        name: userInfo.name,
        email: userInfo.email,
        password: hashPassword(Math.random().toString(36).substring(2, 15))
      }
      // 8. Lưu thông tin user vào database bằng cách gọi hàm register
      const result = await this.register(payload as RegisterReqBody)
      // 9. Trả thông tin user về cho client bao gồm cả new_user để redirect về đúng trang ở client
      return { ...result, new_user: 1, verify: UserVerifyStatus.Unverified }
    }
  }

  async logout(token: string) {
    return await removeRefreshToken(token)
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token: old_refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }): Promise<{ access_token: string; refresh_token: string }> {
    //! K nên gọi lại hàm signAccessAndRefreshToken vì ở đây cần xóa refresh token cũ nên dùng cả 3 hàm trong 1 Promise.all để tối ưu
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      removeRefreshToken(old_refresh_token)
    ])

    const decodeRefreshToken = await this.decodeRefreshToken(refresh_token)

    insertRefreshToken(refresh_token, user_id, decodeRefreshToken.iat, decodeRefreshToken.exp)

    return {
      access_token,
      refresh_token
    }
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
    const followedUser = await this.getFollowerUser(user_id, followed_user_id)

    if (followedUser) {
      return null
    }

    const result = await insertFollower(user_id, followed_user_id)

    return result
  }

  async unfollowUser(user_id: string, followed_user_id: string): Promise<DeleteResult | null> {
    const followedUser = await this.getFollowerUser(user_id, followed_user_id)

    if (!followedUser) {
      return null
    }

    const result = await deleteFollower(user_id, followed_user_id)

    return result
  }

  async changePassword(user_id: string, password: string): Promise<UpdateResult<User>> {
    return await changeUserPassword(user_id, password)
  }

  async getFollowerUser(user_id: string, followed_user_id: string, projection?: Document): Promise<Follower | null> {
    const followed_user_ids = await findFollowerById(user_id, followed_user_id, projection)

    return followed_user_ids
  }

  async getFollowedUserIds(user_id: string, projection?: Document) {
    // Tìm tất cả user_id mà user đang đăng nhập đã follow
    const followedUserIds = await getFollowedUsersByUserId(user_id, projection)
    // Map các user_id đã follow thành mảng
    const followedUserIdsArray = followedUserIds.map((item) => item.followed_user_id)
    // Push user_id của user đang đăng nhập vào mảng để new feed có thể hiển thị tweet của user đang đăng nhập và các user mà user đang đăng nhập đã follow
    followedUserIdsArray.push(new ObjectId(user_id))

    return followedUserIdsArray
  }
}

const userService = new UserService()
export default userService
