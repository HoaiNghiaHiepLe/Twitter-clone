import express from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTP_STATUS from '~/constant/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// Xử lý tuần tự, dừng chạy chuỗi xác thực nếu chuỗi trước đó không thành công.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  // Return an asynchronous middleware function.
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Execute the validation rules against the incoming request.
    await validation.run(req)

    // Collect the results of the validation process.
    const errors = validationResult(req)

    // If there are no validation errors, proceed to the next middleware in the stack.
    if (errors.isEmpty()) {
      return next()
    }

    // If there are errors, map them into an object for easier access and processing.
    // Each key in this object corresponds to a field in the request.
    const errorObject = errors.mapped()

    // Create an instance of 'EntityError' with an initially empty 'errors' object.
    // 'EntityError' can be a custom error class for encapsulating validation errors.
    const entityError = new EntityError({ errors: {} })

    // Iterate through each mapped error.
    for (const key in errorObject) {
      const { msg } = errorObject[key]
      // If an error message is an instance of 'ErrorWithStatus' with a status code other than 'UNPROCESSABLE_ENTITY', forward it immediately to the error handler.
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      // Otherwise, add the error to the 'entityError' object under the corresponding key.
      entityError.errors[key] = errorObject[key]
    }

    // Pass 'entityError' to the next error-handling middleware, which will process all validation errors in entityError object.
    next(entityError)
  }
}
