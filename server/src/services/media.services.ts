import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR } from '~/constant/dir'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
class MediaService {
  async handleUploadImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    // delete file in temp folder after upload
    return `http://localhost:3000/${newName}.jpg`
  }
}

export default new MediaService()
