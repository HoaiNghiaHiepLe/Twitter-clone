import { Router } from 'express'
import { PATH } from '~/constant/path'
import { serveMediaController } from '~/controllers/medias.controllers'

const staticRouter = Router()

/**
 * Description: Unified static route for images and videos
 * Path: /media/:type/:mediaName
 * Method: GET
 * Params: type (image or video), mediaName
 */

staticRouter.get(PATH.STATIC.MEDIA, serveMediaController)

export default staticRouter
