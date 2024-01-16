import { Request, Response } from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { DIR } from '~/constant/dir'
import HTTP_STATUS from '~/constant/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const initFolder = () => {
  ;[path.resolve(DIR.UPLOAD_TEMP_DIR), path.resolve(DIR.UPLOAD_IMAGE_DIR), path.resolve(DIR.UPLOAD_VIDEO_DIR)].forEach(
    (dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
          recursive: true // Purpose is to create nested folders
        })
      }
    }
  )
}

export const uploadImage = async (req: Request): Promise<formidable.File[]> => {
  const MAX_FILE = 4
  const MAX_FILE_SIZE = 300 * 1024 // 300KB

  const form = formidable({
    uploadDir: path.resolve(DIR.UPLOAD_TEMP_DIR),
    maxFiles: MAX_FILE,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE, // 300KB,
    maxTotalFileSize: MAX_FILE_SIZE * MAX_FILE, // 300KB,
    multiples: true,
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

export const uploadVideo = async (req: Request): Promise<formidable.File[]> => {
  const MAX_FILE = 2
  const MAX_FILE_SIZE = 300 * 1024 * 1024 // 300MB
  const nanoId = (await import('nanoid')).nanoid
  const idName = nanoId()

  const folderPath = path.resolve(DIR.UPLOAD_VIDEO_DIR, idName)

  fs.mkdirSync(folderPath)

  const form = formidable({
    uploadDir: path.resolve(DIR.UPLOAD_VIDEO_DIR, idName),
    maxFiles: MAX_FILE,
    maxFileSize: MAX_FILE_SIZE,
    maxTotalFileSize: MAX_FILE_SIZE * MAX_FILE, // 50MB,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || Boolean(mimetype?.includes('quicktime')))

      if (!valid) {
        form.emit('error' as any, new Error('File is not valid') as any)
      }
      return valid
    },
    filename: () => {
      return idName
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!files.video) {
        return reject(
          new ErrorWithStatus({
            message: 'File is empty',
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        )
      }
      const videos = files.video as formidable.File[]

      videos.forEach((video) => {
        //Tách extension của file từ originalFilename
        const videoExtension = getFileExtension(video.originalFilename as string)
        // Đổi filepath cũ (k có ext) và gán thêm extension cho filepath mới trong thư mục uploads
        fs.renameSync(video.filepath, `${video.filepath}.${videoExtension}`)
        // Gán lại đường dẫn mới cho file trả về cho client
        // video.newFilename là đường dẫn tới file mới trả về cho client trong service
        video.newFilename = `${video.newFilename}.${videoExtension}`
        video.filepath = `${video.filepath}.${videoExtension}`
      })

      resolve(files.video as formidable.File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const nameArray = fullName.split('.')
  const name = nameArray.slice(0, nameArray.length - 1).join('')
  return name
}

export const getFileExtension = (fullName: string) => {
  const nameArray = fullName.split('.')
  const extension = nameArray[nameArray.length - 1]
  return extension
}
