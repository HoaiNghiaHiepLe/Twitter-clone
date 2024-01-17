import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR } from '~/constant/dir'
import { getFileExtension, getNameFromFullName, uploadImage, uploadVideo } from '~/utils/file'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constant/config'
import { config } from 'dotenv'
import { MediaType } from '~/constant/enum'
import { Media } from '~/types/Media.type'
import formidable from 'formidable'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

config()
class MediaService {
  //For upload image only controller
  async handleUploadImage(req: Request): Promise<Media[]> {
    const files = await uploadImage(req)
    //? return nhiều file
    const results: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        //? Lưu file vào thư mục uploads kèm theo phần mở rộng .jpg

        const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)

        await sharp(file.filepath).jpeg().toFile(newPath)

        sharp.cache(false)

        fsPromise.unlink(file.filepath)

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

  //For upload video only controller
  async handleUploadVideo(req: Request) {
    const files = await uploadVideo(req)

    //? return nhiều file
    const results: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return results
  }

  // for upload video HLS
  async handleUploadVideoHLS(req: Request): Promise<Media[]> {
    // Upload video files
    const files = await uploadVideo(req)

    //? encode HLS song song từng file video bằng Promise.all
    //? Phải dùng Promise.all ở đây để đảm bảo việc encode của tất cả video hoàn thành mới trả về kết quả
    // Nếu k dùng Promise.all khi hoàn thành encode của video đầu tiên sẽ trả về kết quả cho client => client sẽ nhận được kết quả trước khi encode xong tất cả video
    const results: Media[] = await Promise.all(
      files.map(async (file) => {
        // Gọi hàm để encode HLS cho từng video
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = getNameFromFullName(file.newFilename)
        // Xóa file video gốc sau khi đã convert sang HLS
        await fsPromise.unlink(file.filepath)
        // Tạo Media object để trả về cho client
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}`,
          type: MediaType.HLS
        }
      })
    )
    return results
  }

  // For upload both image and video controller
  async handleUploadImageFiles(files: formidable.File[]): Promise<Media[]> {
    //? return nhiều file
    const results = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)

        //? Lưu file vào thư mục uploads kèm theo phần mở rộng .jpg
        const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        //? Tắt cơ chế cache của sharp để tránh bị lỗi lock file (do sharp tự động cache) khi unlink file bằng fs ở dưới
        //! ex: [Error: EPERM: operation not permitted, unlink 'E:\personal-work\Twitter-clone\server\uploads\temps\9c32def7eebcbbc6e956a2f01.jpg']
        //? Xử lý hình ảnh bằng sharp
        await sharp(file.filepath).jpeg().toFile(newPath)

        sharp.cache(false)

        fsPromise.unlink(file.filepath)

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

  // For upload both image and video controller
  async handleUploadVideoFiles(videos: formidable.File[]): Promise<Media[]> {
    //? return nhiều file
    const results = await Promise.all(
      videos.map(async (video) => {
        const newVideoName = getNameFromFullName(video.newFilename)

        const videoExtension = getFileExtension(video.originalFilename as string)

        const newPath = path.resolve(DIR.UPLOAD_VIDEO_DIR, `${newVideoName}.${videoExtension}`)

        fsPromise.rename(video.filepath, newPath)
        video.newFilename = `${newVideoName}.${videoExtension}`
        video.filepath = newPath

        return {
          url: isProduction
            ? `${process.env.HOST}/static/${video.newFilename}`
            : `http://localhost:${process.env.PORT}/static/${video.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return results
  }
}

export default new MediaService()
