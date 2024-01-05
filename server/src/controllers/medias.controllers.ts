import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import { PATH } from '~/constant/path'

export const uploadImageController = async (req: Request, res: Response) => {
  //? Nếu lỗi import thì dùng cách này
  // const formidable = await (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve(PATH.FOLDER.UPLOAD_IMAGE),
    maxFiles: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024 // 300KB,
  })

  const result = await form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    return res.json({
      message: 'Upload image successfully'
    })
  })
}
