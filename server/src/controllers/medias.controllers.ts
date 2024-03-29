import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { isProduction } from '~/constant/config'
import { DIR } from '~/constant/dir'
import { ErrorWithStatus } from '~/models/Errors'
import mediaServices from '~/services/medias.service'
import fs from 'fs'
import formidable from 'formidable'
import HTTP_STATUS from '~/constant/httpStatus'
import { interpolateMessage } from '~/utils/utils'
import { MESSAGE } from '~/constant/message'
import VideoEncodingStatus from '~/models/schemas/videoStatus.chema'
import { sendFileFromS3 } from '~/utils/s3'

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediaServices.handleUploadImage(req)
  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'upload image' }),
    url
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediaServices.handleUploadVideo(req)
  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'upload video' }),
    url
  })
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const url = await mediaServices.handleUploadVideoHLS(req)
  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'upload video hls' }),
    url
  })
}

export const uploadMediaController = async (req: Request, res: Response) => {
  const MAX_IMAGE_FILES = 3
  const MAX_VIDEO_FILES = 2
  const MAX_IMAGE_SIZE = 300 * 1024 //300KB
  const MAX_VIDEO_SIZE = 1024 * 1024 * 50 //5MB
  const MAX_TOTAL_FILES = MAX_IMAGE_FILES + MAX_VIDEO_FILES

  const form = formidable({
    uploadDir: path.resolve(DIR.UPLOAD_TEMP_DIR),
    maxFiles: MAX_TOTAL_FILES,
    keepExtensions: true
  })

  form.parse(req, async (err, fields, uploadedFiles) => {
    if (err) {
      return res.status(500).json({ message: 'Error processing upload', error: err })
    }

    const images: formidable.File[] = []
    const videos: formidable.File[] = []

    const filesArray = uploadedFiles.files

    if (filesArray) {
      filesArray.forEach((file) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          if (images.length <= MAX_IMAGE_FILES && file.size <= MAX_IMAGE_SIZE) {
            images.push(file)
          }
        } else if (file.mimetype && file.mimetype.startsWith('video/')) {
          if (videos.length <= MAX_VIDEO_FILES && file.size <= MAX_VIDEO_SIZE) {
            videos.push(file)
          }
        }
      })

      // Process images and videos
      try {
        const imageResults = images.length > 0 ? await mediaServices.handleUploadImageFiles(images) : []

        // Create a new request-like object for videos
        const videoResults = videos.length > 0 ? await mediaServices.handleUploadVideoFiles(videos) : []

        return res.json({
          message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'upload medias' }),
          images: imageResults,
          videos: videoResults
        })
      } catch (processingError) {
        return res.status(500).json({ message: 'Error processing media', error: processingError })
      }
    } else {
      return res.status(400).json({ message: 'No files uploaded' })
    }
  })
}

export const videoEncodeStatusController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await mediaServices.getVideoEncodingStatus(id as unknown as Pick<VideoEncodingStatus, 'name'>)

  if (!result) {
    throw new ErrorWithStatus({
      message: interpolateMessage(MESSAGE.NOT_FOUND, { field: 'Video' }),
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  return res.json({
    status: result?.status,
    message: result.notification
  })
}

//? serve image
export const serveImageController = (req: Request, res: Response) => {
  const { fileName } = req.params

  const filePath = path.resolve(DIR.UPLOAD_IMAGE_DIR, fileName + '.jpg')

  // Serve the file if it exists
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath)
  }
  return redirectToNotFound(res)
}

//? Video streaming
export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  //import mime fix ES Module import trong CommonJS
  const mime = (await import('mime')).default
  const range = req.headers.range

  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }

  const { fileName } = req.params
  const filePath = path.resolve(DIR.UPLOAD_VIDEO_DIR, fileName)
  //? 1MB = 10^6 bytes (Tính theo hệ 10, đây là thứ mà chũng ta hay thấy trên UI)
  //? 1MiB = 2^20 bytes (Tính theo hệ 2, 1024 * 1024, đây là thứ mà chúng ta hay thấy trong code)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(filePath).size
  // dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 6 // 1MB
  // Lấy giá trị byte bắt đầu từ header Range (vd: bytes=1048576)
  const start = Number(range.replace(/\D/g, ''))
  // Lấy giá trị byte kết thúc từ header Range (vd: bytes=1048576-2097151), Vượt quá giá trị video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  // Thường đây sẽ là chunkSize, ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1
  const contentType = mime.getType(filePath) || 'video/*'

  /**
   * Format của header Content-Range: bytes <start> - <end>/<videoSize>
   * Ví dụ: Content-Range: bytes 1048576-3145727/3145728
   * Yêu cầu là `end` phải luôn luôn nhỏ hơn `videoSize`
   * ❌ 'Content-Range': 'bytes 0-100/100'
   * ✅ 'Content-Range': 'bytes 0-99/100'
   *
   * Còn Content-Length sẽ là end - start + 1. Đại diện cho khoảng cách.
   * Để dễ hình dung, mọi người tưởng tượng từ số 0 đến số 10 thì ta có 11 số.
   * byte cũng tương tự, nếu start = 0, end = 10 thì ta có 11 byte.
   * Công thức là end - start + 1
   *
   * ChunkSize = 50
   * videoSize = 100
   * |0----------------50|51----------------99|100 (end)
   * stream 1: start = 0, end = 50, contentLength = 51
   *           start = 0, end = 0 + 50 (start + chunkSize) < 100 - 1 (videoSize - 1) => end = 50, contentLength = 50 - 0 + 1  = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   *           start = 51, end = 51 + 50 (start + chunkSize) > 100 - 1 (videoSize - 1) => end = 100 - 1 = 99, contentLength = 99 - 51 + 1 = 49
   * 
   * vd về lỗi sai contentLength và contentRange:
    headers {
    'Content-Range': 'bytes 222494720-222511740/222511741',
    'Accept-Ranges': 'bytes',
    'Content-Length': 17021,
    'Content-Type': 'video/mp4'
    }
    Nếu end = Math.min(start + chunkSize, videoSize) ở lần chunk cuối khi data đã chunk start + chunkSize > videoSize => end = videoSize,
    vd: 'Content-Range': 'bytes 222494720-222511741/222511741' nên 222494720-222511741 = 17021 bytes => data cần chunk là 17021 bytes
    Nếu contentLength = end - start thì 'Content-Length': 17020 trong khi data cần chunk là 17021 (sai 1 byte)
    => Lỗi, k play đc video
   */
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  // HTTP Status 206: content bị chia nhiều đoạn (partial content)
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoSteams = fs.createReadStream(filePath, { start, end })
  // Phương thức pipe() cho phép chúng ta đọc dữ liệu từ một stream và ghi dữ liệu vào một stream khác
  videoSteams.pipe(res)
}

//! Lưu ý khi đổi nơi lưu file video
//! Phải thay dổi cả ở hàm serveM3u8Controller và serveSegmentController
//! Vì cần cả file master m3u8 và các file segment cùng 1 folder trả về cho client nếu khồng sẽ lỗi 404

//? Video streaming m3u8
export const serveM3u8Controller = async (req: Request, res: Response, next: NextFunction) => {
  const { id, masterM3u8 } = req.params

  // Trả về file từ s3 bằng hàm sendFileFromS3 vơi đường dẫn là `video-hls/${id}/${masterM3u8}`
  // video-hls là folder chứa file master m3u8 và các file segment trên s3
  // masterM3u8 đc gửi lên từ req.params luôn có định dạng là master.m3u8
  return sendFileFromS3(res, `video-hls/${id}/${masterM3u8}`)
  // trả về file lưu trong local để xem từ client khi không sử dụng s3
  // return res.sendFile(path.resolve(DIR.UPLOAD_VIDEO_DIR, id, masterM3u8), (err) => {
  //   if (err) return res.status(404).send('Not found')
  // })
}

//? Video streaming ts segment
export const serveSegmentController = async (req: Request, res: Response, next: NextFunction) => {
  const { id, version, segment } = req.params

  // Trả về file từ s3 bằng hàm sendFileFromS3 vơi đường dẫn là `video-hls/${id}/${version}/${segment}`
  // video-hls là folder chứa file master m3u8 và các file segment trên s3
  // version là folder chứa các file segment
  // segment là file segment
  return sendFileFromS3(res, `video-hls/${id}/${version}/${segment}`)

  // trả về file lưu trong local để xem từ client khi không sử dụng s3
  // return res.sendFile(path.resolve(DIR.UPLOAD_VIDEO_DIR, id, version, segment), (err) => {
  //   if (err) return res.status(404).send('Not found')
  // })
}

//? serve both image and video
export const serveMediaController = (req: Request, res: Response) => {
  const { mediaType, fileName } = req.params

  let filePath
  if (mediaType === 'image') {
    filePath = path.resolve(DIR.UPLOAD_IMAGE_DIR, fileName + '.jpg')
  } else if (mediaType === 'video') {
    filePath = path.resolve(DIR.UPLOAD_VIDEO_DIR, fileName)
  } else {
    return res.status(400).send('Invalid media type')
  }

  // Serve the file if it exists
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath)
  }
  return redirectToNotFound(res)
}

function redirectToNotFound(res: Response) {
  const urlRedirect = isProduction
    ? `${process.env.HOST}/not-found`
    : `http://localhost:${process.env.PORT_CLIENT}/not-found`
  res.redirect(urlRedirect)
}
