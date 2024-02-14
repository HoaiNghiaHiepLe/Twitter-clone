import { Router } from 'express'
import { PATH } from '~/constant/path'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, getConversationsValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationsRouter = Router()

/**
 * Description: Get conversations of receiver
 * Path: /receiver/:receiver_id
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Params: receiver_id
 */
conversationsRouter.get(
  PATH.CONVERSATIONS.GET_CONVERSATIONS,
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getConversationsValidator,
  wrapRequestHandler(getConversationsController)
)

export default conversationsRouter
