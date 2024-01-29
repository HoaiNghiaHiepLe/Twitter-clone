import { Router } from 'express'
import { PATH } from '~/constant/path'
import { searchController } from '~/controllers/search.controllers'
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
searchRouter.get('/', searchController)

export default searchRouter
