import { MediaRequestQuery } from '~/constant/enum'
import { Pagination } from './Tweet.request'

export type SearchRequestQuery = {
  q?: string
  f?: MediaRequestQuery
} & Pagination
