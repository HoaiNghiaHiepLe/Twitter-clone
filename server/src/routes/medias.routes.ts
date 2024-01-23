import { Router } from 'express'
import { PATH } from '~/constant/path'
import {
  uploadImageController,
  uploadMediaController,
  uploadVideoController,
  uploadVideoHLSController,
  videoEncodeStatusController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * Description: Upload Images
 * Path: /upload-image
 * Method: POST
 * Body: { image : files}
 */
mediasRouter.post(
  PATH.MEDIA.UPLOAD_IMAGE,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(uploadImageController)
)

/**
 * Description: Upload video
 * Path: /upload-video
 * Method: POST
 * Body: { video: files}
 */
mediasRouter.post(
  PATH.MEDIA.UPLOAD_VIDEO,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(uploadVideoController)
)

/**
 * Description: Upload video
 * Path: /upload-video
 * Method: POST
 * Body: { video: files}
 */
mediasRouter.post(
  PATH.MEDIA.UPLOAD_VIDEO_HLS,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

/**
 * Description: Upload medias
 * Path: /upload-medias
 * Method: POST
 * Body: { files: files}
 */
mediasRouter.post(PATH.MEDIA.UPLOAD_MEDIA, accessTokenValidator, verifyUserValidator, uploadMediaController)

/**
 * Description: Upload medias
 * Path: /video-encode-status/:id
 * Method: GET
 */
mediasRouter.get(
  PATH.MEDIA.VIDEO_ENCODE_STATUS,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(videoEncodeStatusController)
)

export default mediasRouter
