import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import tweetServices from '~/services/tweet.services'
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
