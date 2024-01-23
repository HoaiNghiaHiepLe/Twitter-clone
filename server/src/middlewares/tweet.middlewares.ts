import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constant/enum'
import HTTP_STATUS from '~/constant/httpStatus'
import { MESSAGE } from '~/constant/message'
import { ErrorWithStatus } from '~/models/Errors'
import { findTweetById } from '~/repository/tweet.repository'
import { convertEnumToArray } from '~/utils/common'
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
                  field: 'tweet'
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
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)
