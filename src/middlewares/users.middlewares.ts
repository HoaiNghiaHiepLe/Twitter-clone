import { ParamSchema, check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import HTTP_STATUS from '~/constant/httpStatus'
import { USER_MESSAGE } from '~/constant/message'
import { ErrorWithStatus } from '~/models/Errors'
import { checkExistEmail, authenticateUser, checkUserRefreshToken, findUserById } from '~/repository/users.repository'
import { verifyToken } from '~/utils/jwt'
import { interpolateMessage } from '~/utils/utils'
import { validate } from '~/utils/validation'
import capitalize from 'lodash/capitalize'
import { NextFunction, Request, Response } from 'express'
import { UserVerifyStatus } from '~/constant/enum'
import { FollowReqBody, TokenPayload } from '~/models/requests/User.request'
import userService from '~/services/user.services'
import { ObjectId } from 'mongodb'

const passwordSchema: ParamSchema = {
  notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'password' }) },
  isString: { errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: 'password' }) },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: interpolateMessage(USER_MESSAGE.LENGTH, { field: 'password', min: '6', max: '50' })
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGE.PASSWORD_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'confirm password' }) },
  isString: { errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: 'confirm password' }) },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: interpolateMessage(USER_MESSAGE.LENGTH, { field: 'confirm password', min: '6', max: '50' })
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: interpolateMessage(USER_MESSAGE.STRONG, {
      field: 'confirm password',
      minLength: '6',
      uppercase: '1',
      minSymbols: '1'
    })
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(interpolateMessage(USER_MESSAGE.NOT_MATCH, { field: 'confirm password' }))
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'name' }) },
  isString: { errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: 'name' }) },
  isLength: {
    options: { min: 3, max: 100 },
    errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: 'name', min: '3', max: '100' })
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'date of birth' }) },
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: interpolateMessage(USER_MESSAGE.INVALID, { field: 'date of birth' })
  }
}

const commonSchema = ({
  field,
  minLength,
  maxLength
}: {
  field: string
  minLength: number | string
  maxLength: number | string
}) => ({
  isString: { errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: field.toString() }) },
  isLength: {
    options: { min: Number(minLength), max: Number(maxLength) },
    errorMessage: interpolateMessage(USER_MESSAGE.LENGTH, {
      field: field.toString(),
      min: minLength.toString(),
      max: maxLength.toString()
    })
  },
  trim: true,
  optional: true
})

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: { errorMessage: interpolateMessage(USER_MESSAGE.INVALID, { field: 'email' }) },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await authenticateUser(value as string, req.body.password as string)

            if (user === null) {
              throw Error(interpolateMessage(USER_MESSAGE.INCORRECT, { field: 'email or password' }))
            }

            req.user = user

            return true
          }
        }
      },
      password: {
        notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'password' }) },
        isString: { errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: 'password' }) },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: interpolateMessage(USER_MESSAGE.LENGTH, { field: 'password', min: '6', max: '50' })
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: { errorMessage: interpolateMessage(USER_MESSAGE.INVALID, { field: 'email' }) },
        notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'email' }) },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await checkExistEmail(value as string)

            if (isExistEmail) {
              throw Error(interpolateMessage(USER_MESSAGE.ALREADY_EXISTS, { field: 'email' }))
            }

            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'access token' }),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: interpolateMessage(USER_MESSAGE.INVALID, { field: 'access token' }),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'refresh token' }),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        },

        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                checkUserRefreshToken(value)
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: interpolateMessage(USER_MESSAGE.INVALID, { field: 'refresh token' }),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'email verify token' }),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: { errorMessage: interpolateMessage(USER_MESSAGE.INVALID, { field: 'email' }) },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await checkExistEmail(value as string)

            if (!user) {
              throw new ErrorWithStatus({
                message: interpolateMessage(USER_MESSAGE.NOT_FOUND, { field: 'user' }),
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            if (user.verify !== UserVerifyStatus.Verified) {
              throw new ErrorWithStatus({
                message: interpolateMessage(USER_MESSAGE.UNVERIFIED, { field: 'Your account' }),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            req.user = user

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: {
        trim: true,
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'forgot password token' }),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        },
        custom: {
          options: async (value, { req }) => {
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload

  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: interpolateMessage(USER_MESSAGE.UNVERIFIED, { field: 'Your account' }),
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true, notEmpty: undefined },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: commonSchema({ field: 'bio', minLength: 1, maxLength: 100 }),
      location: commonSchema({ field: 'location', minLength: 1, maxLength: 200 }),
      website: commonSchema({ field: 'website', minLength: 1, maxLength: 400 }),
      username: commonSchema({ field: 'username', minLength: 1, maxLength: 50 }),
      avatar: commonSchema({ field: 'avatar', minLength: 1, maxLength: 400 }),
      cover_photo: commonSchema({ field: 'cover photo', minLength: 1, maxLength: 400 })
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: interpolateMessage(USER_MESSAGE.INVALID, { field: 'Followed user id' }),
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            const verifiedUser = await findUserById(value, { verify: 1 })

            if (verifiedUser?.verify !== UserVerifyStatus.Verified) {
              throw new ErrorWithStatus({
                message: interpolateMessage(USER_MESSAGE.UNVERIFIED, { field: 'User' }),
                status: HTTP_STATUS.FORBIDDEN
              })
            }
          }
        }
      }
    },
    ['body']
  )
)
