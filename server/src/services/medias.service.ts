import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { DIR } from '~/constant/dir'
import { getFileExtension, getNameFromFullName, uploadImage, uploadVideo } from '~/utils/file'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constant/config'
import { config } from 'dotenv'
import { EncodingStatus, MediaType, VideoEncodingNotification } from '~/constant/enum'
import { Media } from '~/types/Media.type'
import formidable from 'formidable'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import { findVideoEncoding, insertVideoEncodingStatus } from '~/repository/medias.repository'
import VideoEncodingStatus from '~/models/schemas/videoStatus.chema'
import { uploadFileToS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'

config()

class Queue {
  // Lưu trữ danh sách các video đang được encode
  queueList: string[]
  // Trạng thái encode
  encoding: boolean
  // Hàm khởi tạo
  constructor() {
    this.queueList = []
    this.encoding = false
  }
  // Hàm thêm video vào queue
  async enqueue(queueItem: string) {
    // Thêm video vào cuối queue list
    this.queueList.push(queueItem)
    // Cập nhật trạng thái encode của video
    await this.handleQueueStatus({ queueItem })
    // Gọi hàm xử lý encode
    this.processEncode()
    console.log('this.queueList', this.queueList)
  }

  async processEncode() {
    // Nếu đang encode thì return
    if (this.encoding) return
    // Nếu queue list có video thì tiến hành encode
    if (this.queueList.length > 0) {
      // Set trạng thái đang encode
      this.encoding = true
      // Lấy video đầu tiên trong queue list
      const videoPath = this.queueList[0]
      // Cập nhật trạng thái encode của video
      await this.handleQueueStatus({
        queueItem: videoPath,
        status: EncodingStatus.Processing,
        notification: VideoEncodingNotification.Processing
      })
      // Tiến hành encode video
      try {
        // Gọi hàm để encode HLS cho từng video
        await encodeHLSWithMultipleVideoStreams(videoPath)
        // Sau khi encode xong thì xóa video đầu tiên trong queue list
        this.queueList.shift()
        // Xóa file video gốc sau khi đã convert sang HLS
        await fsPromise.unlink(videoPath)
        // Cập nhật trạng thái encode của video
        await this.handleQueueStatus({
          queueItem: videoPath,
          status: EncodingStatus.Success,
          notification: VideoEncodingNotification.Success
        })
        console.log(`Encode video ${videoPath} successfully`)
      } catch (error) {
        // Nếu có lỗi xảy ra thì cập nhật trạng thái encode của video
        await this.handleQueueStatus({
          queueItem: videoPath,
          status: EncodingStatus.Failed,
          notification: VideoEncodingNotification.Failed
        }).catch((error) => {
          // Nếu có lỗi xảy ra trong quá trình cập nhật trạng thái encode thì log ra console
          console.log('Update video encode status failed', error)
        })
        console.log(`Encode video ${videoPath} error`)
        console.log(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
  // Hàm cập nhật trạng thái encode của video
  async handleQueueStatus({
    queueItem,
    status = EncodingStatus.Pending,
    notification = VideoEncodingNotification.Pending
  }: {
    queueItem: string
    status?: EncodingStatus
    notification?: VideoEncodingNotification
  }) {
    // Lấy id của video từ đường dẫn
    const idName = getNameFromFullName(queueItem.split('\\').pop() as string)
    // Cập nhật trạng thái encode của video vào database
    await insertVideoEncodingStatus(
      new VideoEncodingStatus({ name: idName, status: status, notification: notification })
    )
  }
}

const queue = new Queue()
class MediaService {
  //For upload image only controller
  async handleUploadImage(req: Request): Promise<Media[]> {
    //import mime fix ES Module import trong CommonJS
    const mime = (await import('mime')).default
    const files = await uploadImage(req)
    //? return nhiều file
    const results: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        //? Lưu file vào thư mục uploads kèm theo phần mở rộng .jpg
        const newFullFileName = `${newName}.jpg`

        const newPath = path.resolve(DIR.UPLOAD_IMAGE_DIR, newFullFileName)

        await sharp(file.filepath).jpeg().toFile(newPath)

        const s3Result = await uploadFileToS3({
          // Tạo folder images và lưu file ảnh vào folder images
          fileName: `images/${newFullFileName}`,
          filePath: newPath,
          ContentType: mime.getType(newFullFileName) as string
        })

        sharp.cache(false)

        // Sử dụng khi lưu ảnh trong server, chỉ xóa file ảnh ở thư mục temp sau khi đã lưu vào thư mục uploads
        // fsPromise.unlink(file.filepath)

        // Sử dụng khi lưu ảnh ở aws s3, xóa file ảnh ở thư mục temp và thư mục uploads sau khi đã lưu vào s3
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        //? Trả về đường dẫn tới file ở server k kèm theo phần mở rộng
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newName}`
        //     : `http://localhost:${process.env.PORT}/static/image/${newName}`,
        //   type: MediaType.Image
        // }
        //? Trả về đường dẫn trên aws s3 sau khi đã upload
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )
    return results
  }

  //For upload video only controller
  async handleUploadVideo(req: Request) {
    const files = await uploadVideo(req)
    const mime = (await import('mime')).default

    //? return nhiều file
    const results: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          fileName: `videos/${file.newFilename}`,
          filePath: file.filepath,
          ContentType: mime.getType(file.newFilename) as string
        })
        //? Xóa file video ở thư mục uploads/videos sau khi đã upload lên s3
        await fsPromise.unlink(file.filepath)

        // Xóa thư mục chứa file video sau khi đã upload lên s3
        const directoryPath = path.dirname(file.filepath)

        await fsPromise.rm(directoryPath, { recursive: true, force: true })

        //? Trả về đường dẫn tới file ở aws s3 sau khi đã upload
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
        //? Trả về đường dẫn tới file ở server sau khi đã upload
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )

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
        const newName = getNameFromFullName(file.newFilename) + '/master.m3u8'
        // Gọi hàm để queue encode HLS cho từng video
        queue.enqueue(file.filepath)
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

  getVideoEncodingStatus(id: Pick<VideoEncodingStatus, 'name'>) {
    return findVideoEncoding(id)
  }
}

export default new MediaService()
