import { Router } from 'express'
import { PATH } from '~/constant/path'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'

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
  getConversationsController
)

export default conversationsRouter
