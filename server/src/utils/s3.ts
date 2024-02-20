import { Upload } from '@aws-sdk/lib-storage'
import { S3 } from '@aws-sdk/client-s3'
import fs from 'fs'
import { Response } from 'express'
import { envConfig } from '~/constant/config'

const s3 = new S3({
  region: envConfig.awsRegion,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
  }
})

// test list bucket
// s3.listBuckets({}).then((data) => console.log(data.Buckets))
// test file upload to s3
// const file = fs.readFileSync(path.resolve('uploads/images/c70e3af5949bcee1c8e3f6900.jpg'))

export const uploadFileToS3 = async ({
  fileName,
  filePath,
  ContentType
}: {
  fileName: string
  filePath: string
  ContentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      // Tên bucket s3 trên aws
      Bucket: envConfig.awsS3BucketName,
      // Tên file sẽ lưu trên s3
      Key: fileName,
      // Nội dung file sẽ gửi lên s3
      Body: fs.readFileSync(filePath),
      ContentType: ContentType
    },

    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })
  return parallelUploads3.done()
}

// Mục đích: k để cho client truy cập trực tiếp vào s3 mà phải thông qua server của mình làm trung gian (proxy) để truy cập s3 và trả về file
// Phương thức này giúp kiểm soát quyền truy cập file trên s3, giúp ẩn thông tin file trên s3
// Chỉ cho phép truy cập file thông qua server của mình
// Trên s3 có thể tạo policy để giới hạn quyền truy cập file chỉ từ server của mình
export const sendFileFromS3 = async (res: Response, filePath: string) => {
  try {
    //? Lấy file từ s3 bằng getobject
    const data = await s3.getObject({
      // Tên bucket s3 trên aws
      Bucket: envConfig.awsS3BucketName,
      // Tên file sẽ lưu trên s3
      Key: filePath
    }) //? Trả về file dưới dạng stream
    // vì thư viện k khai báo type của data.Body nên phải ép kiểu any
    ;(data.Body as any).pipe(res)
  } catch (error) {
    res.status(404).send('Not found')
  }
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((data) => {
//   console.log(data)
// })
