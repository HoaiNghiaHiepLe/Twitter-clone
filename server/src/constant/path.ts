export const PATH = {
  BASE: {
    USERS: '/users',
    MEDIAS: '/medias',
    STATIC: '/static'
  },
  USER: {
    LOGIN: '/login',
    OAUTH: '/oauth/google',
    REGISTER: '/register',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token',
    VERIFY_EMAIL: '/verify-email',
    RESEND_VERIFY_EMAIL: '/resend-verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    CHANGE_PASSWORD: '/change-password',
    ME: '/me',
    GET_USER: '/:username',
    FOLLOW: '/follow',
    UNFOLLOW: '/follow/:followed_user_id'
  },
  MEDIA: {
    UPLOAD_IMAGE: '/upload-image',
    UPLOAD_VIDEO: '/upload-video',
    UPLOAD_VIDEO_HLS: '/upload-video-hls',
    UPLOAD_MEDIA: '/upload-media'
  },
  STATIC: {
    MEDIA: '/:mediaType/:fileName',
    IMAGE: '/image/:fileName',
    VIDEO_STREAM: '/video-stream/:fileName'
  }
} as const
