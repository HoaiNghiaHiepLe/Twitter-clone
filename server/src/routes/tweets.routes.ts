import { Router } from 'express'
import { PATH } from '~/constant/path'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controllers'
import {
  createTweetController,
  getNewsFeedController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
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
  PATH.TWEET.CREATE_TWEET,
  accessTokenValidator,
  verifyUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description: Get new feeds
 * Path: /new-feeds
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {skip: number, limit: number}
 */
tweetsRouter.get(
  PATH.TWEET.GET_NEW_FEEDS,
  paginationValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNewsFeedController)
)

/**
 * Description: Get a tweet
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Params: {tweet_id: string}
 */
tweetsRouter.get(
  PATH.TWEET.GET_TWEET,
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * Description: Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 * Query: {skip: number, limit: number, tweet_type: TweetType}
 */
tweetsRouter.get(
  PATH.TWEET.GET_TWEET_CHILDREN,
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
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
 * Method: DELETE
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
