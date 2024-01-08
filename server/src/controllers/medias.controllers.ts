import { Request, Response } from 'express'
import path from 'path'
import { isProduction } from '~/constant/config'
import { DIR } from '~/constant/dir'
import { ErrorWithStatus } from '~/models/Errors'
import mediaServices from '~/services/media.services'

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediaServices.handleUploadImage(req)
  return res.json({
    message: 'Upload image successfully',
    url
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { fileName } = req.params

  //? Redirect về trang not found nếu không tìm thấy file
  const urlRedirect = isProduction
    ? `${process.env.HOST}/not-found`
    : `http://localhost:${process.env.PORT_CLIENT}/not-found`

  //? Trả về file nếu tìm thấy kèm theo phần mở rộng .jpg
  return res.sendFile(path.resolve(DIR.UPLOAD_IMAGE_DIR, fileName + '.jpg'), (err) => {
    if (err) {
      res.redirect(urlRedirect)
    }
  })
}
