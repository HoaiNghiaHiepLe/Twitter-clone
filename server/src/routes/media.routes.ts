import { Router } from 'express'
import { PATH } from '~/constant/path'
import { uploadImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * Description: Login a user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
mediasRouter.post(PATH.MEDIA.UPLOAD_IMAGE, wrapRequestHandler(uploadImageController))

export default mediasRouter
