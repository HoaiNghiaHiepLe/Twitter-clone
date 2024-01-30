import { Router } from 'express'
import { PATH } from '~/constant/path'
import { searchController } from '~/controllers/search.controllers'
import { searchTweetsValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouter = Router()

/**
 * Description: Search tweets
 * Path: /search
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Body: TweetRequestBody
 */
searchRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  searchTweetsValidator,
  paginationValidator,
  searchController
)

export default searchRouter
