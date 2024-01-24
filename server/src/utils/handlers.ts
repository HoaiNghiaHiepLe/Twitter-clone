import { NextFunction, Request, RequestHandler, Response } from 'express'

// wrapRequestHandler: Bọc một controller bằng một middleware
// Để bắt lỗi trong controller
// chuyển tất cả lỗi trong controller về error handler defaultErrorHandler bằng next(error)

export const wrapRequestHandler =
  <P>(func: RequestHandler<P>) =>
  async (req: Request<P>, res: Response, next: NextFunction) => {
    //? Dùng Promise.resolve() để bắt lỗi trong async function
    //? Với điều kiện controller phải là async function
    // Promise.resolve(func(req, res, next)).catch(next)
    //? Hoặc dùng try/catch
    //? Controller không cần phải là async function
    try {
      //? func(req, res, next) là controller
      await func(req, res, next)
    } catch (error) {
      //? next(error) để bắt lỗi trong controller và chuyển về error handler defaultErrorHandler
      next(error)
    }
  }

// Mong muốn nhận vào là : Request<{username: string}>
// Thực nhận là: Request<ParamsDictionary> có dạng là Request<{[key:string]:string}>

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //req.header vs req.headers
    //req.header: Không phân biệt hoa thường ví dụ: req.header('Authorization') === req.header('authorization')
    // req.headers của express js: Phân biệt hoa thường ví dụ: req.headers chỉ có req.headers.authorization
    if (req.headers.authorization) {
      // nếu có authorization thì mới chạy middleware
      return middleware(req, res, next)
    }
    // nếu không có authorization thì next()
    next()
  }
}
