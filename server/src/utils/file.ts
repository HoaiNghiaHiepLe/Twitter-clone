import { Request, Response } from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import HTTP_STATUS from '~/constant/httpStatus'
import { PATH } from '~/constant/path'
import { ErrorWithStatus } from '~/models/Errors'

export const initFolder = () => {
  const uploadsImagesPath = path.resolve(PATH.FOLDER.UPLOAD_IMAGE)
  if (!fs.existsSync(uploadsImagesPath)) {
    fs.mkdirSync(uploadsImagesPath, {
      recursive: true // mục đích là để tạo folder nested
    })
  }
}

export const handleUploadImage = async (req: Request, res: Response): Promise<formidable.Files<string>> => {
  const form = formidable({
    uploadDir: path.resolve(PATH.FOLDER.UPLOAD_IMAGE),
    maxFiles: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024, // 300KB,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!valid) {
        form.emit('error' as any, new Error('File is not valid') as any)
      }
      return valid
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!files.image) {
        return reject(
          new ErrorWithStatus({
            message: 'File is empty',
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        )
      }
      resolve(files)
    })
  })
}
