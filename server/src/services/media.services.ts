import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR } from '~/constant/dir'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constant/config'
import { config } from 'dotenv'

config()
class MediaService {
  async handleUploadImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)

    //? Lưu file vào thư mục uploads kèm theo phần mở rộng .jpg
    const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)
    // delete file in temp folder after upload
    fs.unlinkSync(file.filepath)

    //? Trả về đường dẫn tới file k kèm theo phần mở rộng
    return isProduction
      ? `${process.env.HOST}/static/${newName}`
      : `http://localhost:${process.env.PORT}/static/${newName}`
  }
}

export default new MediaService()
