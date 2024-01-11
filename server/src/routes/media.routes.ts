import { Router } from 'express'
import { PATH } from '~/constant/path'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
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

export default mediasRouter
