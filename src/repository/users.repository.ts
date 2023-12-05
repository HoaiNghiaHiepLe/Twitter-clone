import { ObjectId } from 'mongodb'
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
      date_of_birth: new Date(payload.date_of_birth as string),
      password: hashPassword(payload.password)
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
