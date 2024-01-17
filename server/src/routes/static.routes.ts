import { Router } from 'express'
import { PATH } from '~/constant/path'
import {
  serveImageController,
  serveMediaController,
  serveVideoStreamController,
  serveM3u8Controller,
  serveSegmentController
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
 * Description: custom static route for video streaming
 * Path: /video-stream/:fileName
 * Method: GET
 * Params: fileName
 */
// 1 static route for video streaming
staticRouter.get(PATH.STATIC.VIDEO_STREAM, serveVideoStreamController)

/**
 * Description: serving m3u8 / fetching master.m3u8 file for MediaPlayer from client
 * Path: '/video-hls/:id/master.m3u8'
 * Method: GET
 * Params: fileName
 */
// 1 static route for serve video hls m3u8
staticRouter.get(PATH.STATIC.VIDEO_M3U8, serveM3u8Controller)

/**
 * Description: serving video ts segment / fetching segment file for MediaPlayer from client when it need to change video quality
 * Path: '/video-hls/:id/:version/:segment'
 * Method: GET
 * Params: fileName
 */
// 1 static route for serve video hls segment
staticRouter.get(PATH.STATIC.VIDEO_SEGMENT, serveSegmentController)

export default staticRouter
