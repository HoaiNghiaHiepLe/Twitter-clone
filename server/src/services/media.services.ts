import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR } from '~/constant/dir'
import { getNameFromFullName, uploadImage, uploadVideo } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constant/config'
import { config } from 'dotenv'
import { MediaType } from '~/constant/enum'
import { Media } from '~/types/Media.type'
import formidable from 'formidable'

config()
class MediaService {
  async handleUploadImage(req: Request): Promise<Media[]> {
    const files = await uploadImage(req)

    //? return nhiều file
    const results = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        //? Lưu file vào thư mục uploads kèm theo phần mở rộng .jpg

        const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)

        await sharp(file.filepath).jpeg().toFile(newPath)

        sharp.cache(false)

        fs.unlinkSync(file.filepath)

        //? Trả về đường dẫn tới file k kèm theo phần mở rộng
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}`
            : `http://localhost:${process.env.PORT}/static/image/${newName}`,
          type: MediaType.Image
        }
      })
    )
    return results
  }

  async handleUploadImageFiles(files: formidable.File[]): Promise<Media[]> {
    //? return nhiều file
    const results = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)

        //? Lưu file vào thư mục uploads kèm theo phần mở rộng .jpg
        const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)

        await sharp(file.filepath).jpeg().toFile(newPath)

        fs.unlinkSync(file.filepath)

        //? Trả về đường dẫn tới file k kèm theo phần mở rộng
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}`
            : `http://localhost:${process.env.PORT}/static/image/${newName}`,
          type: MediaType.Image
        }
      })
    )
    return results
  }

  async handleUploadVideo(req: Request) {
    const files = await uploadVideo(req)

    //? return nhiều file
    const results: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return results
  }

  async handleUploadVideoFiles(files: formidable.File[]): Promise<Media[]> {
    //? return nhiều file
    const results = await Promise.all(
      files.map(async (file) => {
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${file.newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return results
  }
}

export default new MediaService()
