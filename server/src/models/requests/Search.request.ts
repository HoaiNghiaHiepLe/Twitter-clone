import { MediaRequestQuery } from '~/constant/enum'
import { Pagination } from './Tweet.request'
import { Query } from 'express-serve-static-core'

export type SearchRequestQuery = {
  q?: string
  f?: MediaRequestQuery
  pf?: string
} & Pagination &
  Query
