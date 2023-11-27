import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapRequestHandler = (func: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  //? Dùng Promise.resolve() để bắt lỗi trong async function
  //? Với điều kiện controller phải là async function
  // Promise.resolve(func(req, res, next)).catch(next)
  //? Hoặc dùng try/catch
  //? Controller không cần phải là async function
  try {
    await func(req, res, next)
  } catch (error) {
    next(error)
  }
}
