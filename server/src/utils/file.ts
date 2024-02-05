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
      // Tạo tên mới cho file video bằng nanoid
      return nanoId()
    }
  })

  //? Trả về một promise
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      //? Nếu có lỗi thì reject
      if (err) {
        reject(err)
      }
      //? Nếu không có file video thì reject
      if (!files.video) {
        return reject(
          new ErrorWithStatus({
            message: 'File is empty',
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        )
      }
      //? Lấy ra mảng các file video
      const videos = files.video as formidable.File[]

      //? Lặp qua từng file video
      videos.forEach((video) => {
        //! Lưu ý: video.filepath, video.newfilename, video.filepath lúc này là đường dẫn tạm thời của file video: DIR.UPLOAD_TEMP_DIR

        //? Lấy extension của file video
        const videoExtension = getFileExtension(video.originalFilename as string)

        //? 1. Tạo tên mới cho file video từ tên dã lưu bằng nanoid và extension
        const newFileName = `${video.newFilename}.${videoExtension}`

        //? 2. Tạo đường dẫn mới cho file video từ tên đã tạo bằng nanoid
        const folderPath = path.resolve(DIR.UPLOAD_VIDEO_DIR, video.newFilename)

        //? Nếu thư mục chứa file video không tồn tại thì tạo mới
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath)
        }

        //? 3. Tạo đường dẫn mới cho file video
        const newFilePath = path.resolve(folderPath, newFileName)

        //? 4. Move file video từ thư mục cũ khi vừa upload lên và xử lý bằng formidable vào thư mục mới đã tạo ở trên
        fs.renameSync(video.filepath, newFilePath)

        //? 5. Cập nhật lại thông tin cho file video
        video.newFilename = newFileName
        video.filepath = newFilePath
      })
      //? Trả về mảng các file video
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

export const getFilesInDir = (dir: string, files: string[] = []) => {
  //? Lấy ra danh sách các file trong thư mục
  const filesInDir = fs.readdirSync(dir)
  //? Lặp qua từng file trong thư mục
  for (const file of filesInDir) {
    //? Tạo đường dẫn đầy đủ cho file trong thư mục chứa nó
    const pathToFile = `${dir}/${file}`
    //? Nếu file đó là thư mục thì lặp lại hàm getFilesInDir với tham số là đường dẫn của thư mục đó
    if (fs.statSync(pathToFile).isDirectory()) {
      //? Lặp lại hàm getFilesInDir với tham số là đường dẫn của thư mục đó
      getFilesInDir(pathToFile, files)
    } else {
      //? Nếu file đó không phải là thư mục thì push vào mảng files
      files.push(pathToFile)
    }
  }
  //? Trả về mảng files
  //? Mảng files này sẽ chứa đường dẫn đầy đủ của tất cả các file trong thư mục và các thư mục con của nó
  return files
}
