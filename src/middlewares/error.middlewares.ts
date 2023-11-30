import { Request, Response, NextFunction } from 'express'
import omit from 'lodash/omit'
import HTTP_STATUS from '~/constant/httpStatus'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
