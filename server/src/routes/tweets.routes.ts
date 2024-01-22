import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
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
tweetsRouter.post('/', accessTokenValidator, verifyUserValidator, wrapRequestHandler(createTweetController))

export default tweetsRouter
