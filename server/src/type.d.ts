import { Request } from 'express'
import User from './models/schemas/Users.schema'
import { TokenPayload } from './models/requests/User.request'
import Tweet from './models/schemas/Tweets.schema'
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

// Định nghĩa các biến môi trường
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // SERVER
      readonly PORT: string
      readonly PORT_CLIENT: string
      readonly HOST: string

      //MONGODB
      readonly DB_USERNAME: string
      readonly DB_PASSWORD: string
      readonly DB_NAME: string

      //COLLECTIONS
      readonly DB_USERS_COLLECTION: string
      readonly DB_REFRESH_TOKENS_COLLECTION: string
      readonly DB_FOLLOWERS_COLLECTION: string
      readonly DB_VIDEO_ENCODING_STATUS_COLLECTION: string
      readonly DB_TWEETS_COLLECTION: string
      readonly DB_HASHTAGS_COLLECTION: string
      readonly DB_BOOKMARKS_COLLECTION: string
      readonly DB_LIKES_COLLECTION: string
      readonly DB_CONVERSATIONS_COLLECTION: string

      //PASSWORD & SECRET KEYS
      readonly PASSWORD_SECRET: string
      readonly JWT_SECRET_ACCESS_TOKEN: string
      readonly JWT_SECRET_REFRESH_TOKEN: string
      readonly JWT_SECRET_EMAIL_VERIFY_TOKEN: string
      readonly JWT_SECRET_FORGOT_PASSWORD_TOKEN: string

      //TOKEN EXPIRES IN
      readonly REFRESH_TOKEN_EXPIRES_IN: string
      readonly ACCESS_TOKEN_EXPIRES_IN: string
      readonly EMAIL_VERIFY_TOKEN_EXPIRES_IN: string
      readonly FORGOT_PASSWORD_TOKEN_EXPIRES_IN: string

      //GOOGLE
      readonly GOOGLE_CLIENT_ID: string
      readonly GOOGLE_CLIENT_SECRET: string
      readonly GOOGLE_REDIRECT_URI: string
      readonly CLIENT_REDIRECT_URI: string
      readonly CLIENT_URL: string

      //AWS
      readonly AWS_ACCESS_KEY_ID: string
      readonly AWS_SECRET_ACCESS_KEY: string
      readonly AWS_REGION: string
      readonly SES_FROM_ADDRESS: string
      readonly S3_BUCKET_NAME: string
    }
  }
}
