import { Document, ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constant/enum'
import { RegisterReqBody } from '~/models/requests/User.request'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'

export const checkExistEmail = async (email: string) => {
  const user = await databaseService.users.findOne({ email })
  return user
}

export const authenticateUser = async (email: string, password: string) => {
  const user = await databaseService.users.findOne({ email, password: hashPassword(password) })

  if (user === null) {
    return null
  }

  return user
}

export const insertUser = async (payload: RegisterReqBody) => {
  const user = await databaseService.users.insertOne(
    new User({
      ...payload,
      _id: new ObjectId(payload.user_id),
      date_of_birth: new Date(payload.date_of_birth as string),
      password: hashPassword(payload.password),
      email_verify_token: payload.email_verify_token as string
    })
  )

  return user
}

export const insertRefreshToken = async (token: string, user_id: string) => {
  const refreshToken = new RefreshToken({ token, user_id: new ObjectId(user_id) })

  const result = await databaseService.refreshTokens.updateOne(
    { user_id: refreshToken.user_id },
    {
      $set: {
        token: refreshToken.token
      }
    },
    { upsert: true }
  )

  return result
}

export const checkUserRefreshToken = async (token: string) => {
  const refreshToken = await databaseService.refreshTokens.findOne({ token })

  if (refreshToken === null) {
    return null
  }

  const user = await databaseService.users.findOne({ _id: refreshToken.user_id })

  if (user === null) {
    return null
  }

  return user
}

export const removeRefreshToken = async (token: string) => {
  await databaseService.refreshTokens.deleteOne({ token })
}

export const findUserById = async (user_id: string, projection?: Document) => {
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) }, { projection: projection })

  if (user === null) {
    return null
  }

  return user
}

export const updateEmailVerifyToken = async (user_id: string, emailVerifyToken?: string) => {
  let result = null

  if (emailVerifyToken && emailVerifyToken !== '') {
    result = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: emailVerifyToken
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  } else {
    result = await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified,
          updated_at: '$$NOW'
        }
      }
    ])
  }

  return result
}

export const updateForgotPasswordToken = async (user_id: string, forgotPasswordToken?: string) => {
  // update forgot password token
  const result = await databaseService.users.updateOne(
    { _id: new ObjectId(user_id) },
    {
      $set: {
        forgot_password_token: forgotPasswordToken
      },
      $currentDate: {
        updated_at: true
      }
    }
  )
  // send reset password link to email: https://twitter.com/forgot-password?token=token
  return result
}

export const resetUserPassword = async (user_id: string, password: string) => {
  const result = await databaseService.users.updateOne(
    { _id: new ObjectId(user_id) },
    {
      $set: {
        forgot_password_token: '',
        password: hashPassword(password)
      },
      $currentDate: {
        updated_at: true
      }
    }
  )
  return result
}
