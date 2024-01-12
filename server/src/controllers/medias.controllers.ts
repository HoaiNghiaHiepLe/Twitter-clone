import { Request, Response } from 'express'
import path from 'path'
import { isProduction } from '~/constant/config'
import { DIR } from '~/constant/dir'
import { ErrorWithStatus } from '~/models/Errors'
import mediaServices from '~/services/media.services'
import fs from 'fs'
import formidable from 'formidable'

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

export const uploadMediaController = async (req: Request, res: Response) => {
  const MAX_IMAGE_FILES = 3
  const MAX_VIDEO_FILES = 1
  const MAX_IMAGE_SIZE = 300 * 1024 //300KB
  const MAX_VIDEO_SIZE = 1024 * 1024 * 50 //5MB
  const MAX_TOTAL_FILES = MAX_IMAGE_FILES + MAX_VIDEO_FILES

  const form = formidable({
    uploadDir: path.resolve(DIR.UPLOAD_TEMP_DIR),
    maxFiles: MAX_TOTAL_FILES,
    keepExtensions: true
  })

  form.parse(req, async (err, fields, uploadedFiles) => {
    if (err) {
      return res.status(500).json({ message: 'Error processing upload', error: err })
    }

    const images: formidable.File[] = []
    const videos: formidable.File[] = []

    const filesArray = uploadedFiles.files

    if (filesArray) {
      filesArray.forEach((file) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          if (images.length <= MAX_IMAGE_FILES && file.size <= MAX_IMAGE_SIZE) {
            images.push(file)
          }
        } else if (file.mimetype && file.mimetype.startsWith('video/')) {
          if (videos.length <= MAX_VIDEO_FILES && file.size <= MAX_VIDEO_SIZE) {
            videos.push(file)
          }
        }
      })

      // Process images and videos
      try {
        const imageResults = images.length > 0 ? await mediaServices.handleUploadImageFiles(images) : []

        // Create a new request-like object for videos
        const videoResults = videos.length > 0 ? await mediaServices.handleUploadVideoFiles(videos) : []

        return res.json({
          message: 'Upload media successfully',
          images: imageResults,
          videos: videoResults
        })
      } catch (processingError) {
        return res.status(500).json({ message: 'Error processing media', error: processingError })
      }
    } else {
      return res.status(400).json({ message: 'No files uploaded' })
    }
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
