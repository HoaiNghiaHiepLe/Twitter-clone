import User from '~/models/schemas/User.schema'
import databaseService from './database.services'

class UserService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload
    const result = await databaseService.users.insertOne(
      new User({
        email,
        password
      })
    )
    return result
  }
  async checkExistEmail(email: string) {
    const user = await databaseService.users.findOne({ email })
    console.log(user)
    return Boolean(user)
  }
}

const userService = new UserService()
export default userService