import { Request, Response } from 'express'
import path from 'path'
import { isProduction } from '~/constant/config'
import { DIR } from '~/constant/dir'
import { ErrorWithStatus } from '~/models/Errors'
import mediaServices from '~/services/media.services'
import fs from 'fs'

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediaServices.handleUploadImage(req)
  return res.json({
    message: 'Upload image successfully',
    url
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediaServices.handleUploadVideo(req)
  return res.json({
    message: 'Upload video successfully',
    url
  })
}

export const serveMediaController = (req: Request, res: Response) => {
  const { mediaType, fileName } = req.params

  let filePath
  if (mediaType === 'image') {
    filePath = path.resolve(DIR.UPLOAD_IMAGE_DIR, fileName + '.jpg')
  } else if (mediaType === 'video') {
    filePath = path.resolve(DIR.UPLOAD_VIDEO_DIR, fileName)
  } else {
    return res.status(400).send('Invalid media type')
  }

  // Serve the file if it exists
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath)
  }
  return redirectToNotFound(res)
}

function redirectToNotFound(res: Response) {
  const urlRedirect = isProduction
    ? `${process.env.HOST}/not-found`
    : `http://localhost:${process.env.PORT_CLIENT}/not-found`
  res.redirect(urlRedirect)
}
