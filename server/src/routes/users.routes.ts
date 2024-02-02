import { Router } from 'express'
import {
  changePasswordController,
  emailVerifyController,
  followUserController,
  forgotPasswordController,
  getMeController,
  getUserInfoController,
  loginController,
  logoutController,
  oAuthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowUserController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterDataMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  verifyEmailTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyUserValidator,
  updateMeValidator,
  followValidator,
  unFollowValidator,
  changePasswordValidator,
  forgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { UpdateMeReqBody } from '~/models/requests/User.request'
import { PATH } from '~/constant/path'

const usersRouter = Router()

/**
 * Description: Login a user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post(PATH.USER.LOGIN, loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Oauth with google
 * Path: /oauth/google
 * Method: GET
 * Query: { code: string }
 */
usersRouter.get(PATH.USER.OAUTH, wrapRequestHandler(oAuthController))

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */

usersRouter.post(PATH.USER.REGISTER, registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Logout a user
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {refresh_token: string}
 */

usersRouter.post(PATH.USER.LOGOUT, accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: {refresh_token: string}
 */

usersRouter.post(PATH.USER.REFRESH_TOKEN, refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Verify email when user click on the link in the email
 * Path: /verify-email
 * Method: POST
 * Header:
 * Body: {email_verify_token: string}
 */

usersRouter.post(PATH.USER.VERIFY_EMAIL, verifyEmailTokenValidator, wrapRequestHandler(emailVerifyController))

/**
 * Description: Resend Verify email when user click on the link in the email
 * Path: /resend-verify-email
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {}
 */

usersRouter.post(PATH.USER.RESEND_VERIFY_EMAIL, accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Header: {}
 * Body: {email: string}
 */

usersRouter.post(PATH.USER.FORGOT_PASSWORD, forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify forgot password token
 * Path: /verify-forgot-password
 * Method: POST
 * Header: {}
 * Body: {forgot_password_token: string}
 */

usersRouter.post(
  PATH.USER.VERIFY_FORGOT_PASSWORD,
  forgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Header: {}
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 */

usersRouter.post(PATH.USER.RESET_PASSWORD, resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: Get My Profile
 * Path: /me
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Body: {}
 */

usersRouter.get(PATH.USER.ME, accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: Get My Profile
 * Path: /me
 * Method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 * Body: UserSchema
 */

usersRouter.patch(
  PATH.USER.ME,
  accessTokenValidator,
  verifyUserValidator,
  updateMeValidator,
  filterDataMiddleware<UpdateMeReqBody>([
    'name',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo',
    'date_of_birth'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Get User Info
 * Path: /:username
 * Method: GET
 */

usersRouter.get(PATH.USER.GET_USER, wrapRequestHandler<{ username: string }>(getUserInfoController))

/**
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {followed_user_id: string}
 */

usersRouter.post(
  PATH.USER.FOLLOW,
  accessTokenValidator,
  verifyUserValidator,
  followValidator,
  wrapRequestHandler(followUserController)
)

/**
 * Description: unfollow someone
 * Path: /follow/followed_user_id
 * Method: DELETE
 * Header: {Authorization: Bearer <access_token>}
 * Body: {}
 */

usersRouter.delete(
  PATH.USER.UNFOLLOW,
  accessTokenValidator,
  verifyUserValidator,
  unFollowValidator,
  wrapRequestHandler(unfollowUserController)
)

/**
 * Description: Change password
 * Path: /change-password
 * Method: PUT
 * Header: {Authorization: Bearer <access_token>}
 * Body: {old_password: string, password: string, confirm_password: string}
 */

usersRouter.put(
  PATH.USER.CHANGE_PASSWORD,
  accessTokenValidator,
  verifyUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
