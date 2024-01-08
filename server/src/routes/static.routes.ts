import { Router } from 'express'
import { PATH } from '~/constant/path'
import { serveImageController } from '~/controllers/medias.controllers'

const staticRouter = Router()

/**
 * Description: static route
 * Path: /login
 * Method: GET
 * Params: fileName
 */

staticRouter.get(`/:fileName`, serveImageController)

export default staticRouter
