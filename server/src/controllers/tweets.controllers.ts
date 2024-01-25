import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import tweetServices from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.request'
import { interpolateMessage } from '~/utils/utils'
import { MESSAGE } from '~/constant/message'
import Tweet from '~/models/schemas/Tweet.schema'
import { TweetType } from '~/constant/enum'

config()

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetServices.createTweet(user_id, req.body)
  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'create tweet' }),
    result
  })
}

export const getTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  // Nếu thực hiện query database ở đây là chúng ta đang thực hiện lần query lần thứ 2 vì trước đó đã query ở middleware tweetIdValidator
  // Thực hiện query tại middleware tweetIdValidator và lưu tweet vào req.tweet để sử dụng ở đây
  const { user_id } = req.decoded_authorization as TokenPayload

  // Tăng giá trị view của tweet khi get tweet
  const tweetViews = await tweetServices.increaseTweetView(String((req.tweet as Tweet)._id), String(user_id))

  const tweet = {
    ...req.tweet,
    ...tweetViews
  }

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Get tweet' }),
    result: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const parent_id = req.params.tweet_id as string
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)

  const tweetChildrens = await tweetServices.getTweetChildrenByParentId({
    parent_id,
    tweet_type,
    page,
    limit
  })

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Get tweet children' }),
    result: {
      tweets: tweetChildrens.tweets,
      tweet_type,
      page,
      limit,
      total_page: Math.ceil(tweetChildrens.total / limit)
    }
  })
}
