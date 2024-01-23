import { Router } from 'express'
import { PATH } from '~/constant/path'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controllers'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Description: Create a tweet
 * Path: /
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: TweetRequestBody
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description: Create a bookmark tweet
 * Path: /
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {tweet_id: string}
 */
tweetsRouter.post(
  PATH.LIKE.LIKE_TWEET,
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * Description: Delete a bookmark tweet
 * Path: /:tweet_id
 * Method: Delete
 * Header: {Authorization: Bearer <access_token>}
 * Params: {tweet_id: string}
 */
tweetsRouter.delete(
  PATH.LIKE.UNLIKE_TWEET,
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController)
)

export default tweetsRouter
