import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
// Fix lỗi 'NODE_ENV' is not recognized as an internal or external command:
// https://stackoverflow.com/questions/47499322/node-env-is-not-recognized-as-an-internal-or-external-command
// npm install - g win - node - env(Nếu chạy trên window)
const env = process.env.NODE_ENV
const envFileName = `.env.${env}`

// nếu k truyền env vào script
if (!env) {
  // Thông báo lỗi và dừng chương trình
  console.log('NODE_ENV is not defined (example: NODE_ENV=development, NODE_ENV=production in package.json script)')
  console.log(`detecting NODE_ENV = ${env}`)
  process.exit(1)
}

// Phát hiện file env là NODE_ENV = development hoặc production thì dùng file env tương ứng
console.log(`detecting NODE_ENV = ${env} => using ${envFileName} file`)

if (!fs.existsSync(path.resolve(envFileName))) {
  console.log(`File ${envFileName} is not exist`)
  console.log(
    'caution: App will not use .env file to load environment variables, example: if NODE_ENV = development, it will use .env.development file to load environment variables.'
  )
  console.log(`Please create ${envFileName} or reference to .env.example file to create it`)
  process.exit(1)
}

export const isProduction = env === 'production'

config({
  // Lấy ra env đã truyền ở package.json trong câu lệnh chạy server (npm run dev hoặc npm run start -- --env=development)
  // ko dùng file .env mặc định
  path: envFileName
})

export const envConfig = {
  //? Port server
  port: (process.env.PORT as string) || (4000 as number),
  portClient: (process.env.PORT_CLIENT as string) || (5000 as number),
  host: process.env.HOST as string,

  //? Tên database và tài khoản để kết nối
  dbUserName: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_NAME as string,

  //? Tên các collection trong database
  dbUsersCollection: process.env.DB_USERS_COLLECTION as string,
  dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  dbFollowersCollection: process.env.DB_FOLLOWERS_COLLECTION as string,
  dbVideoEncodingStatusCollection: process.env.DB_VIDEO_ENCODING_STATUS_COLLECTION as string,
  dbTweetsCollection: process.env.DB_TWEETS_COLLECTION as string,
  dbHashtagsCollection: process.env.DB_HASHTAGS_COLLECTION as string,
  dbBookmarksCollection: process.env.DB_BOOKMARKS_COLLECTION as string,
  dbLikesCollection: process.env.DB_LIKES_COLLECTION as string,
  dbConversationsCollection: process.env.DB_CONVERSATIONS_COLLECTION as string,

  //? Password secret và các secret key cho jwt
  passwordSecret: process.env.PASSWORD_SECRET as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,

  //? Thời gian sống của token
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,

  //? Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  clientRedirectUri: process.env.CLIENT_REDIRECT_URI as string,
  clientUrl: process.env.CLIENT_URL as string,

  //? AWS
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  awsSesFromAddress: process.env.SES_FROM_ADDRESS as string,
  awsS3BucketName: process.env.S3_BUCKET_NAME as string
} as const
