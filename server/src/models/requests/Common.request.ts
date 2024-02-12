import { Query } from 'express-serve-static-core'
import { Pagination } from './Tweet.request'

export interface BookmarkTweetRequestBody {
  tweet_id: string
}
export interface LikeTweetRequestBody {
  tweet_id: string
}

export type ConversationRequestQueryParam = {
  receiver_id?: string
  limit?: string
  page?: string
} & Pagination &
  Query
