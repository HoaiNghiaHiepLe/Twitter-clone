export const PATH = {
  BASE: {
    USERS: '/users',
    MEDIAS: '/medias',
    STATIC: '/static',
    TWEETS: '/tweets',
    BOOKMARKS: '/bookmarks',
    SEARCH: '/search'
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
    VERIFY_TOKEN: '/verify-token',
    VERIFY_FORGOT_PASSWORD: '/verify-forgot-password',
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
    UPLOAD_MEDIA: '/upload-media',
    VIDEO_ENCODE_STATUS: '/video-encode-status/:id'
  },
  STATIC: {
    MEDIA: '/:mediaType/:fileName',
    IMAGE: '/image/:fileName',
    VIDEO_STREAM: '/video-stream/:fileName',
    VIDEO_M3U8: '/video-hls/:id/:masterM3u8',
    VIDEO_SEGMENT: '/video-hls/:id/:version/:segment'
  },
  TWEET: {
    CREATE_TWEET: '/',
    GET_TWEET: '/:tweet_id',
    GET_TWEET_CHILDREN: '/:tweet_id/children',
    GET_NEW_FEEDS: '/new-feeds'
  },
  BOOKMARKS: {
    ADD_BOOKMARK_TWEET: '/add/tweet',
    REMOVE_BOOKMARK_BY_TWEET: '/remove/tweet_id/:tweet_id',
    REMOVE_BOOKMARK_BY_ID: '/remove/bookmark_id/:bookmark_id'
  },
  LIKE: {
    LIKE_TWEET: '/like',
    UNLIKE_TWEET: '/unlike/:tweet_id'
  }
} as const
