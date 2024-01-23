import { ObjectId } from 'mongodb'
import Bookmark, { BookmarkConstructor } from '~/models/schemas/bookmark.schema'
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
