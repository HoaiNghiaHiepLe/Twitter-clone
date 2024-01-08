import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR } from '~/constant/dir'
import { getNameFromFullName, handleUpload } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constant/config'
import { config } from 'dotenv'
import { MediaType } from '~/constant/enum'
import { Media } from '~/types/Media.type'

config()
class MediaService {
  async handleUploadImage(req: Request): Promise<Media[]> {
    const files = await handleUpload(req)

    //? return nhiều file
    const results = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        //? Lưu file vào thư mục uploads kèm theo phần mở rộng .jpg

        const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)

        await sharp(file.filepath).jpeg().toFile(newPath)
        console.log(`Image processed and saved: ${newPath}`)

        await fs.unlinkSync(file.filepath)

        //? Trả về đường dẫn tới file k kèm theo phần mở rộng
        return {
          url: isProduction
            ? `${process.env.HOST}/static/${newName}`
            : `http://localhost:${process.env.PORT}/static/${newName}`,
          type: MediaType.Image
        }
      })
    )
    return results
  }
}

export default new MediaService()
