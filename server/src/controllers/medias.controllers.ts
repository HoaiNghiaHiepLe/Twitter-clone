import { Request, Response } from 'express'
import { handleUploadImage } from '~/utils/file'

export const uploadImageController = async (req: Request, res: Response) => {
  const data = await handleUploadImage(req, res)
  return res.json({
    message: 'Upload image successfully',
    data: data?.file
  })
}
