import { ErrorWithStatus } from '~/models/Errors'
import { interpolateMessage } from './utils'
import HTTP_STATUS from '~/constant/httpStatus'
import { MESSAGE } from '~/constant/message'
import { verifyToken } from './jwt'
import { Request } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'

export const convertEnumToArray = (numberEnum: { [key: string]: string | number }, type: 'number' | 'string') => {
  return Object.values(numberEnum).filter((value) => {
    return typeof value === type
  })
}
export function normalizePath(path: string) {
  return path.replace(/\\/g, '/')
}

// fn verify access token nhận vào access_token và req
export const verifyAccessToken = async (access_token: string, req?: Request) => {
  // Nếu không có access_token thì throw error
  if (!access_token) {
    throw new ErrorWithStatus({
      message: interpolateMessage(MESSAGE.INVALID, { field: 'access token' }),
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  try {
    // decode access_token bằng fn verifyToken
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    // Nếu có req (dùng cho express) thì gán decoded_authorization vào req.decoded_authorization để sử dụng ở middleware tiếp theo
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      // Nếu có req thì return true
      return true
    }
    // Nếu k có req (socket.io) thì return decoded_authorization để sử dụng ở middleware tiếp theo
    return decoded_authorization
  } catch (error) {
    // Nếu có lỗi khi decode access_token thì throw error
    if (error instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        message: capitalize((error as JsonWebTokenError).message),
        status: HTTP_STATUS.UNAUTHORIZED
      })
    } else {
      throw error
    }
  }
}
