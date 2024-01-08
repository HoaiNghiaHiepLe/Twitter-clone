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
    const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)
    // delete file in temp folder after upload
    fs.unlinkSync(file.filepath)
    console.log(isProduction)
    return isProduction
      ? `${process.env.HOST}/static/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/static/${newName}.jpg`
  }
}

export default new MediaService()
