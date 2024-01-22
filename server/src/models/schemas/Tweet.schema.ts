import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constant/enum'
import { Media } from '~/types/Media.type'

//? Những thứ class cần xử lý trước khi đưa vào Database
interface TweetConstructor {
  _id?: ObjectId
  user_id: string
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  //? Những thứ sẽ đưa vào Database
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
  //? Những thứ class cần xử lý trước khi đưa vào Database
  constructor({
    _id,
    user_id,
    type,
    audience,
    content,
    parent_id,
    hashtags,
    mentions,
    medias,
    guest_views,
    user_views,
    created_at,
    updated_at
  }: TweetConstructor) {
    this._id = _id
    this.user_id = new ObjectId(user_id)
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id ? new ObjectId(parent_id) : null
    this.hashtags = hashtags
    this.mentions = mentions.map((mention: string) => new ObjectId(mention))
    this.medias = medias
    this.guest_views = guest_views || 0
    this.user_views = user_views || 0
    this.created_at = created_at || new Date()
    this.updated_at = updated_at || new Date()
  }
}
