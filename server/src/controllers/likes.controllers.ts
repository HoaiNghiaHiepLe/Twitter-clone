import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { MESSAGE } from '~/constant/message'
import { BookmarkTweetRequestBody } from '~/models/requests/Common.request'
import { TokenPayload } from '~/models/requests/User.request'
import likeServices from '~/services/like.services'
import { interpolateMessage } from '~/utils/utils'

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { tweet_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload

  const bookmark = await likeServices.likeTweet({ user_id, tweet_id })

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Like tweet' }),
    bookmark
  })
}

export const unlikeTweetController = async (req: Request, res: Response) => {
  //? Delete k gửi body nên dùng req.params
  const { tweet_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  await likeServices.unlikeTweet({ user_id, tweet_id })

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Unlike tweet' })
  })
}
