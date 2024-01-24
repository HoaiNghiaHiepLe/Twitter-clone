import { Request } from 'express'
import User from './models/schemas/User.schema'
import { TokenPayload } from './models/requests/User.request'
import Tweet from './models/schemas/Tweet.schema'
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    tweet?: Tweet
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USERNAME: string
      DB_PASSWORD: string
      DB_NAME: string

      DB_USERS_COLLECTION: string
      DB_REFRESH_TOKEN_COLLECTION: string
      DB_FOLLOWERS_COLLECTION: string
      DB_VIDEO_ENCODING_STATUS_COLLECTION: string
      DB_TWEETS_COLLECTION: string
      DB_HASHTAGS_COLLECTION: string
      DB_BOOKMARKS_COLLECTION: string
      DB_LIKES_COLLECTION: string

      JWT_SECRET_ACCESS_TOKEN: string
      JWT_SECRET_REFRESH_TOKEN: string
      JWT_SECRET_EMAIL_VERIFY_TOKEN: string
      JWT_SECRET_FORGOT_PASSWORD_TOKEN: string

      REFRESH_TOKEN_EXPIRES_IN: string
      ACCESS_TOKEN_EXPIRES_IN: string
      EMAIL_VERIFY_TOKEN_EXPIRES_IN: string
      FORGOT_PASSWORD_TOKEN_EXPIRES_IN: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      GOOGLE_REDIRECT_URI: string
      CLIENT_REDIRECT_URI: string
    }
  }
}
