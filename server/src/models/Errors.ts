import HTTP_STATUS from '~/constant/httpStatus'
import { MESSAGE } from '~/constant/message'
import { interpolateMessage } from '~/utils/utils'

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType

  constructor({
    message = interpolateMessage(MESSAGE.ERROR, {
      action: 'validation'
    }),
    errors
  }: {
    message?: string
    errors: any
  }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
