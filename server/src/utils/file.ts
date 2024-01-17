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

  const form = formidable({
    uploadDir: path.resolve(DIR.UPLOAD_TEMP_DIR),
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
    filename: (name, ext, part, form) => {
      return nanoId()
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
        //? Lấy extension của file video
        const videoExtension = getFileExtension(video.originalFilename as string)

        //? Tạo tên mới cho file video
        const newFileName = `${video.newFilename}.${videoExtension}`

        //? Tạo đường dẫn mới cho file video
        const folderPath = path.resolve(DIR.UPLOAD_VIDEO_DIR, video.newFilename)

        //? Nếu thư mục chưa tồn tại thì tạo mới
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath)
        }

        //? Tạo đường dẫn mới cho file video
        const newFilePath = path.resolve(folderPath, newFileName)

        //? Move file video vào thư mục mới
        fs.renameSync(video.filepath, newFilePath)

        //? Cập nhật lại thông tin cho file video
        video.newFilename = newFileName
        video.filepath = newFilePath
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
