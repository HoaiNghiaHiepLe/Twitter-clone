import { ObjectId } from 'mongodb'

export interface LikeConstructor {
  _id?: ObjectId
  tweet_id: string
  user_id: string
  created_at?: Date
}

export default class Like {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  created_at?: Date

  constructor({ _id, tweet_id, user_id, created_at }: LikeConstructor) {
    this._id = _id
    this.tweet_id = new ObjectId(tweet_id)
    this.user_id = new ObjectId(user_id)
    this.created_at = created_at || new Date()
  }
}
