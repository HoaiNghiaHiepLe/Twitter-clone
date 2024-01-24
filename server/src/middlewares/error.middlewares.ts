import { Request, Response, NextFunction } from 'express'
import omit from 'lodash/omit'
import HTTP_STATUS from '~/constant/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { defineProperty } from '~/utils/utils'

// defaultErrorHandler là một middleware
// Nó nhận vào 4 tham số
// Nếu có lỗi xảy ra trong controller
// Thì controller sẽ gọi next(error) để bắt lỗi
// defaultErrorHandler sẽ nhận được error và xử lý, trả về cho client
// Tại defaultErrorHandler, ta có thể custom lại lỗi trả về cho client theo ý mình

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }

  defineProperty(err)

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: err
  })
}
