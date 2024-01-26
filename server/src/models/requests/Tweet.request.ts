import { TweetAudience, TweetType } from '~/constant/enum'
import { Media } from '~/types/Media.type'
import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  mentions: string[] // user_id[]
  medias: Media[]
}

export interface TweetRequestQuery extends Pagination, Query {
  page: string
  limit: string
  tweet_type: string
}

export interface TweetRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface Pagination {
  page: string
  limit: string
}
