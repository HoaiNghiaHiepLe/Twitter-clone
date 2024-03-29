export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum MediaRequestQuery {
  Image = 'image',
  Video = 'video'
}

export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}

export enum VideoEncodingNotification {
  Pending = 'Encoding video is pending',
  Processing = 'Encoding video is processing',
  Success = 'Encoding video is success',
  Failed = 'Encoding video is failed'
}

export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum PeopleFollowType {
  Everyone = '0',
  Followed = '1'
}
