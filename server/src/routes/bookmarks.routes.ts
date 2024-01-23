import { Router } from 'express'
import { PATH } from '~/constant/path'
import {
  bookmarkTweetController,
  unbookmarkByIdController,
  unbookmarkByTweetController
} from '~/controllers/bookmarks.controllers'
import { bookmarkIdValidator, tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Description: Create a bookmark tweet
 * Path: /
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {tweet_id: string}
 */
bookmarksRouter.post(
  PATH.BOOKMARKS.BOOKMARK_TWEET,
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Delete a bookmark tweet
 * Path: /:tweet_id
 * Method: Delete
 * Header: {Authorization: Bearer <access_token>}
 * Params: {tweet_id: string}
 */
bookmarksRouter.delete(
  PATH.BOOKMARKS.UNBOOKMARK_BY_TWEET,
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkByTweetController)
)

/**
 * Description: Delete a bookmark tweet
 * Path: /:tweet_id
 * Method: Delete
 * Header: {Authorization: Bearer <access_token>}
 * Params: {tweet_id: string}
 */
bookmarksRouter.delete(
  PATH.BOOKMARKS.UNBOOKMARK_BY_ID,
  accessTokenValidator,
  verifyUserValidator,
  bookmarkIdValidator,
  wrapRequestHandler(unbookmarkByIdController)
)

export default bookmarksRouter
