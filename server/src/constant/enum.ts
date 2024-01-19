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