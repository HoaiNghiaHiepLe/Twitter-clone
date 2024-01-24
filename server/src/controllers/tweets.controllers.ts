import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import tweetServices from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.request'
import { interpolateMessage } from '~/utils/utils'
import { MESSAGE } from '~/constant/message'

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
  const { tweet } = req as Request
  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Get tweet' }),
    result: tweet
  })
}
