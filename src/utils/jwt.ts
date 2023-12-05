import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constant/httpStatus'

config()

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) reject(error)
      resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: {
  token: string
  secretOrPublicKey?: string
  options?: SignOptions
}) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, options, (error, decoded) => {
      if (error) throw reject(new ErrorWithStatus({ message: error.message, status: HTTP_STATUS.UNAUTHORIZED }))
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
