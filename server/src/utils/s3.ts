import { Upload } from '@aws-sdk/lib-storage'
import { S3 } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import fs from 'fs'

config()

const s3 = new S3({
  region: process.env.AWS_REGION as string,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
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
      Bucket: 'twitter-clone-2024',
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

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((data) => {
//   console.log(data)
// })
