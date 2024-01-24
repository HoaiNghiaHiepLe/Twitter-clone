import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constant/enum'
import HTTP_STATUS from '~/constant/httpStatus'
import { MESSAGE } from '~/constant/message'
import { ErrorWithStatus } from '~/models/Errors'
import Tweet from '~/models/schemas/Tweet.schema'
import { findBookmarkById } from '~/repository/bookmarks.repository'
import { findTweetById } from '~/repository/tweets.repository'
import { findUserById } from '~/repository/users.repository'
import { convertEnumToArray } from '~/utils/common'
import { wrapRequestHandler } from '~/utils/handlers'
import { interpolateMessage } from '~/utils/utils'
import { validate } from '~/utils/validation'

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [convertEnumToArray(TweetType, 'number')],
          errorMessage: interpolateMessage(MESSAGE.INVALID, {
            field: 'tweet type'
          })
        }
      },
      audience: {
        isIn: {
          options: [convertEnumToArray(TweetAudience, 'number')],
          errorMessage: interpolateMessage(MESSAGE.INVALID, {
            field: 'tweet audience'
          })
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            //? Nếu `type` là retweet, comment, quotetweet thì `parent_id` phải là `tweet_id` của tweet cha, nếu `type` là tweet thì `parent_id` phải là `null`
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(
                interpolateMessage(MESSAGE.MUST_BE, {
                  field: 'parent id',
                  type: 'valid tweet id'
                })
              )
            }
            if (type === TweetType.Tweet && value !== null) {
              throw new Error(
                interpolateMessage(MESSAGE.MUST_BE, {
                  field: 'parent id',
                  type: 'null'
                })
              )
            }
            return true
          }
        }
      },
      content: {
        isString: {
          errorMessage: interpolateMessage(MESSAGE.MUST_BE, {
            field: 'content',
            type: 'string'
          })
        },
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as ObjectId[]
            const mentions = req.body.mentions as ObjectId[]
            //? Nếu `type` là retweet thì `content` phải là `''`. Nếu `type` là comment, quotetweet, tweet và không có `mentions` và `hashtags` thì `content` phải là string và không được rỗng.
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error(
                interpolateMessage(MESSAGE.INVALID, {
                  field: 'content'
                })
              )
            }
            if (type === TweetType.Retweet && value !== '') {
              throw new Error(
                interpolateMessage(MESSAGE.MUST_BE, {
                  field: 'content',
                  type: 'empty string'
                })
              )
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: {
          errorMessage: interpolateMessage(MESSAGE.MUST_BE, {
            field: 'hashtags',
            type: 'array'
          })
        },
        custom: {
          options: (value, { req }) => {
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(
                interpolateMessage(MESSAGE.MUST_BE, {
                  field: 'hashtags',
                  type: 'array of string'
                })
              )
            }
            return true
          }
        }
      },
      mentions: {
        isArray: {
          errorMessage: interpolateMessage(MESSAGE.MUST_BE, {
            field: 'mentions',
            type: 'array'
          })
        },
        custom: {
          options: (value, { req }) => {
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(
                interpolateMessage(MESSAGE.MUST_BE, {
                  field: 'mentions',
                  type: 'array of user id'
                })
              )
            }
            return true
          }
        }
      },
      medias: {
        isArray: {
          errorMessage: interpolateMessage(MESSAGE.MUST_BE, {
            field: 'medias',
            type: 'array of media'
          })
        },
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array phải là Media Object
            if (
              value.some(
                (item: any) =>
                  typeof item.url !== 'string' || !convertEnumToArray(MediaType, 'number').includes(item.type)
              )
            ) {
              throw new Error(
                interpolateMessage(MESSAGE.MUST_BE, {
                  field: 'medias',
                  type: 'array of media object'
                })
              )
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: interpolateMessage(MESSAGE.INVALID, {
                  field: 'tweet id'
                }),
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const isValidTweet = await findTweetById(value as string)
            if (!isValidTweet) {
              throw new ErrorWithStatus({
                message: interpolateMessage(MESSAGE.NOT_FOUND, {
                  field: 'tweet'
                }),
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            //? Lưu tweet vào req.tweet để sử dụng ở middleware audienceValidator
            ;(req as Request).tweet = isValidTweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const bookmarkIdValidator = validate(
  checkSchema(
    {
      bookmark_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: interpolateMessage(MESSAGE.INVALID, {
                  field: 'bookmark id'
                }),
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const isValidBookmark = await findBookmarkById(value as string)
            if (!isValidBookmark) {
              throw new ErrorWithStatus({
                message: interpolateMessage(MESSAGE.NOT_FOUND, {
                  field: 'bookmark'
                }),
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

// Muốn sử dụng async await trong handler express thì phải có try catch, nếu k dùng try catch thì phải dùng middleware wrapRequestHandler
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  // Nếu tweet này là tweet private thì kiểm tra người xem tweet này có nằm trong Twitter Circle của người đăng tweet hay không
  if (tweet.audience === TweetAudience.TwitterCircle) {
    //Kiểm tra người xem tweet này đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: interpolateMessage(MESSAGE.IS_REQUIRED, {
          field: 'access token'
        }),
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    // Kiểm tra tài khoản của người đăng tweet có ổn không (bị khóa hay bị xóa chưa)
    const author = await findUserById(String(tweet.user_id))

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: interpolateMessage(MESSAGE.NOT_FOUND, {
          field: 'user'
        }),
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    //Kiểm tra người xem tweet này có trong Twitter Circle của người đăng tweet hay không
    const { user_id } = req.decoded_authorization

    // Check xem người xem tweet này có trong Twitter Circle của người đăng tweet hay không
    const isInTwitterCircle = author.twitterCircle?.some((userCircleId) => new ObjectId(userCircleId).equals(user_id))

    // Nếu người xem tweet này k phải là người đăng tweet thì k cho phép xem
    // Nếu người xem tweet này không có trong Twitter Circle của người đăng tweet thì không cho xem
    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        message: interpolateMessage(MESSAGE.IS_NOT, {
          action: 'this tweet',
          permission: 'viewable'
        }),
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
  // Nếu tweet này là tweet public thì cho phép xem
  next()
})
