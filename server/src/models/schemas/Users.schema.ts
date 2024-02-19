import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constant/enum'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: 'hieple.dev.1209@gmail.com'
 *         password:
 *           type: string
 *           example: 'Hiep123!'
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
 *         refresh_token:
 *           type: string
 *           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
 *     SuccessGetMe:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           example: '65b2386524e7120262946e84'
 *         name:
 *           type: string
 *           example: 'Hieple'
 *         email:
 *           type: string
 *           example: 'hieple.dev.1209@gmail.com'
 *         dateOfBirth:
 *           type: string
 *           format: ISO8601
 *           example: '2023-12-12T00:00:00.000Z'
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           example: '2024-12-09T00:00:00.000Z'
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           example: '2024-12-09T00:00:00.000Z'
 *         verify:
 *           type: integer
 *           example: 1
 *           enum: [Unverified, Verified, Banned]
 *         twitterCircle:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           example: ['65b2386524e7120262946e84', '65b2386524e7120262946e85']
 *         bio:
 *           type: string
 *           example: 'I am a developer'
 *         location:
 *           type: string
 *           example: 'Danang, Vietnam'
 *         website:
 *           type: string
 *           example: 'https://hieple.com'
 *         username:
 *           type: string
 *           example: 'hieple1209'
 *         avatar:
 *           type: string
 *           example: 'https://hieple.com/avatar.jpg'
 *         cover_photo:
 *           type: string
 *           example: 'https://hieple.com/cover.jpg'
 */

interface UserType {
  _id?: ObjectId
  name?: string
  email: string
  date_of_birth?: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus
  twitterCircle?: string[] // Danh sách những người mà user này add vào twitter circle để co thể thấy tweet của họ
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus
  twitterCircle?: ObjectId[]
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.name = user.name || ''
    this.email = user.email
    this.date_of_birth = user.date_of_birth || date
    this.password = user.password
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.twitterCircle = user.twitterCircle?.map((item: string) => new ObjectId(item)) || []
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }
}
