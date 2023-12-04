import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
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
