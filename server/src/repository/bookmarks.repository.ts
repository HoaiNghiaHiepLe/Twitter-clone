import { ObjectId } from 'mongodb'
import Bookmark from '~/models/schemas/bookmark.schema'
import databaseService from '~/services/database.services'

export const insertOneBookmarkTweet = async ({ user_id, tweet_id }: Bookmark) => {
  const result = await databaseService.bookmarks.findOneAndUpdate(
    {
      //? filter
      user_id: user_id,
      tweet_id: tweet_id
    },
    {
      //? update
      $setOnInsert: new Bookmark({
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

export const findAndDeleteBookmarkByTweet = async ({ user_id, tweet_id }: Bookmark) => {
  const result = await databaseService.bookmarks.findOneAndDelete({
    user_id: user_id,
    tweet_id: tweet_id
  })
  return result
}

export const findAndDeleteBookmarkById = async (bookmark_id: string) => {
  const result = await databaseService.bookmarks.findOneAndDelete({
    _id: new ObjectId(bookmark_id)
  })
  return result
}

export const findBookmarkById = async (bookmark_id: string) => {
  const result = await databaseService.bookmarks.findOne({
    _id: new ObjectId(bookmark_id)
  })
  return result
}
