import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constant/httpStatus'
import { MESSAGE } from '~/constant/message'
import { ErrorWithStatus } from '~/models/Errors'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.request'
import { TokenPayload } from '~/models/requests/User.request'
import bookmarkServices from '~/services/bookmark.services'
import { interpolateMessage } from '~/utils/utils'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { tweet_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload

  const bookmark = await bookmarkServices.bookmarkTweet({ user_id, tweet_id })

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'bookmark tweet' }),
    bookmark
  })
}
