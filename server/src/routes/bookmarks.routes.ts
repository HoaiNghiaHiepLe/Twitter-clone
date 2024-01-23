import { Router } from 'express'
import { bookmarkTweetController } from '~/controllers/bookmars.controllers'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Description: Create a bookmark
 * Path: /
 * Method: POST
 * Header: {Authorization: Bearer <access_token>}
 * Body: {tweet_id: string}
 */
bookmarksRouter.post('', accessTokenValidator, verifyUserValidator, wrapRequestHandler(bookmarkTweetController))

export default bookmarksRouter
