import { ObjectId } from 'mongodb'
import Like from '~/models/schemas/like.schema'
import databaseService from '~/services/database.service'

export const insertOneTweetLike = async ({ user_id, tweet_id }: Like) => {
  const result = await databaseService.likes.findOneAndUpdate(
    {
      //? filter
      user_id: user_id,
      tweet_id: tweet_id
    },
    {
      //? update
      $setOnInsert: new Like({
        user_id: String(user_id),
        tweet_id: String(tweet_id),
        _id: new ObjectId()
      })
    },

    {
      //? options
      upsert: true,
      returnDocument: 'after'
    }
  )
  return result
}

export const findAndDeleteTweetLike = async ({ user_id, tweet_id }: Like) => {
  const result = await databaseService.likes.findOneAndDelete({
    user_id: user_id,
    tweet_id: tweet_id
  })
  return result
}
