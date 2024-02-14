import { ParamsDictionary } from 'express-serve-static-core'
import { Pagination } from './Tweet.request'

export type GetConversationParam = {
  receiver_id?: string
  limit?: string
  page?: string
} & Pagination &
  ParamsDictionary
