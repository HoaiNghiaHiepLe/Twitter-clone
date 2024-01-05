import fs from 'fs'
import path from 'path'
import { PATH } from '~/constant/path'
export const initFolder = () => {
  const uploadsImagesPath = path.resolve(PATH.FOLDER.UPLOAD_IMAGE)
  if (!fs.existsSync(uploadsImagesPath)) {
    fs.mkdirSync(uploadsImagesPath, {
      recursive: true // mục đích là để tạo folder nested
    })
  }
}
