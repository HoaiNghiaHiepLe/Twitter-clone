import { Request, Response } from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { DIR } from '~/constant/dir'
import HTTP_STATUS from '~/constant/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const initFolder = () => {
  const uploadTempDir = path.resolve(DIR.UPLOAD_TEMP_DIR)
  if (!fs.existsSync(uploadTempDir)) {
    fs.mkdirSync(uploadTempDir, {
      recursive: true // mục đích là để tạo folder nested
    })
  }
}

export const handleUpload = async (req: Request): Promise<formidable.File[]> => {
  const MAX_FILE = 4
  const MAX_FILE_SIZE = 300 * 1024 // 300KB
  const form = formidable({
    uploadDir: path.resolve(DIR.UPLOAD_TEMP_DIR),
    maxFiles: MAX_FILE,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE, // 300KB,
    maxTotalFileSize: MAX_FILE_SIZE * MAX_FILE, // 300KB,
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
      resolve(files.image as formidable.File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const nameArray = fullName.split('.')
  const name = nameArray.slice(0, nameArray.length - 1).join('')
  return name
}
