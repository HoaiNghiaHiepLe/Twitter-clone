import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import HTTP_STATUS from '~/constant/httpStatus'
import { USER_MESSAGE } from '~/constant/message'
import { ErrorWithStatus } from '~/models/Errors'
import { checkExistEmail, authenticateUser, checkUserRefreshToken } from '~/repository/users.repository'
import { verifyToken } from '~/utils/jwt'
import { interpolateMessage } from '~/utils/utils'
import { validate } from '~/utils/validation'
import capitalize from 'lodash/capitalize'
import { Request } from 'express'

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
      name: {
        notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'name' }) },
        isString: { errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: 'name' }) },
        isLength: {
          options: { min: 3, max: 100 },
          errorMessage: interpolateMessage(USER_MESSAGE.MUST_BE_A_STRING, { field: 'name', min: '3', max: '100' })
        },
        trim: true
      },
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
      password: {
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
      },
      confirm_password: {
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
      },
      date_of_birth: {
        notEmpty: { errorMessage: interpolateMessage(USER_MESSAGE.IS_REQUIRED, { field: 'date of birth' }) },
        isISO8601: {
          options: { strict: true, strictSeparator: true },
          errorMessage: interpolateMessage(USER_MESSAGE.INVALID, { field: 'date of birth' })
        }
      }
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
