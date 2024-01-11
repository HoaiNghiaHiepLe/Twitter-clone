import { Router } from 'express'
import { PATH } from '~/constant/path'
import {
  serveImageController,
  serveMediaController,
  serveVideoStreamController
} from '~/controllers/medias.controllers'

const staticRouter = Router()

/**
 * Description: Unified static route for images and videos
 * Path: /:type/:mediaName
 * Method: GET
 * Params: type (image or video), mediaName
 */
// 1 static route for both images and videos
// staticRouter.get(PATH.STATIC.MEDIA, serveMediaController)

/**
 * Description: static route for images
 * Path: /image/:fileName
 * Method: GET
 * Params: type (image or video), mediaName
 */
// 1 static route for just images
staticRouter.get(PATH.STATIC.IMAGE, serveImageController)

/**
 * Description: static route for video streaming
 * Path: /video-stream/:fileName
 * Method: GET
 * Params: fileName
 */
// 1 static route for video streaming
staticRouter.get(PATH.STATIC.VIDEO_STREAM, serveVideoStreamController)

export default staticRouter
