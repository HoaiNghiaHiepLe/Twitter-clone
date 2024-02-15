import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { Pagination, TweetRequestBody, TweetRequestParams, TweetRequestQuery } from '~/models/requests/Tweet.request'
import tweetServices from '~/services/tweets.service'
import { TokenPayload } from '~/models/requests/User.request'
import { interpolateMessage } from '~/utils/utils'
import { MESSAGE } from '~/constant/message'
import Tweet from '~/models/schemas/Tweets.schema'
import { TweetType } from '~/constant/enum'
import userService from '~/services/user.service'

config()

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetServices.createTweet(user_id, req.body)
  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'create tweet' }),
    result
  })
}

export const getTweetController = async (req: Request<ParamsDictionary, any, TweetRequestParams>, res: Response) => {
  // Nếu thực hiện query database ở đây là chúng ta đang thực hiện lần query lần thứ 2 vì trước đó đã query ở middleware tweetIdValidator
  // Thực hiện query tại middleware tweetIdValidator và lưu tweet vào req.tweet để sử dụng ở đây
  const { user_id } = req.decoded_authorization as TokenPayload

  // Tăng giá trị view của tweet khi get tweet
  const tweetViews = await tweetServices.increaseTweetView(String((req.tweet as Tweet)._id), String(user_id))

  const tweet = {
    ...req.tweet,
    guest_views: tweetViews.guest_views,
    user_views: tweetViews.user_views,
    updated_at: tweetViews.updated_at
  }

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Get tweet' }),
    result: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<TweetRequestParams, any, any, TweetRequestQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const parent_id = req.params.tweet_id as string
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)

  const tweetChildren = await tweetServices.getTweetChildrenByParentId({
    parent_id,
    tweet_type,
    page,
    limit,
    user_id
  })

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Get tweet children' }),
    result: {
      tweets: tweetChildren.tweets,
      tweet_type,
      page,
      limit,
      total_pages: Math.ceil(tweetChildren.totalTweets / limit)
    }
  })
}

export const getNewsFeedController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)

  const userIdsArray = await userService.getFollowedUserIds(user_id, {
    _id: 0,
    followed_user_id: 1
  })

  const newsFeed = await tweetServices.getNewsFeed({
    user_id: user_id,
    user_ids: userIdsArray,
    page,
    limit
  })

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Get newsfeed' }),
    result: {
      newsFeed,
      page,
      limit,
      total_pages: Math.ceil(newsFeed.totalTweets / limit)
    }
  })
}
