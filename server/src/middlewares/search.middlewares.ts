import { checkSchema } from 'express-validator'
import { MediaRequestQuery, MediaType, PeopleFollowType } from '~/constant/enum'
import { MESSAGE } from '~/constant/message'
import { interpolateMessage } from '~/utils/utils'
import { validate } from '~/utils/validation'

export const searchTweetsValidator = validate(
  checkSchema(
    {
      q: {
        optional: true,
        isString: {
          errorMessage: interpolateMessage(MESSAGE.MUST_BE, {
            field: 'content',
            type: 'string'
          })
        }
      },
      f: {
        optional: true,
        isIn: {
          options: [Object.values(MediaRequestQuery)]
        },
        errorMessage: interpolateMessage(MESSAGE.MUST_BE, {
          field: 'file',
          type: Object.values(MediaRequestQuery).join(' or ')
        })
      },
      pf: {
        optional: true,
        isIn: {
          //Phiên bản express validator 6.12.0 trở lên hỗ trợ options phải có cấu trúc là mảng 2 chiều (two-dimensional array): [[],[]]
          options: [Object.values(PeopleFollowType)]
        },
        errorMessage: interpolateMessage(MESSAGE.MUST_BE, {
          field: 'file',
          type: '0 or 1'
        })
      }
    },
    ['query']
  )
)
