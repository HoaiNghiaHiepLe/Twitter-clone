import { Pagination } from './Tweet.request'

export type SearchRequestQuery = {
  q: string
} & Pagination
