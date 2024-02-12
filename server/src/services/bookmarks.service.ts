import { ObjectId } from 'mongodb'
import Bookmark, { BookmarkConstructor } from '~/models/schemas/Bookmarks.schema'
import {
  findAndDeleteBookmarkById,
  findAndDeleteBookmarkByTweet,
  insertOneBookmarkTweet
} from '~/repository/bookmarks.repository'

class bookmarkServices {
  async bookmarkTweet({ user_id, tweet_id }: BookmarkConstructor) {
    if (!tweet_id || !user_id) return false

    const result = await insertOneBookmarkTweet(new Bookmark({ tweet_id, user_id }))

    if (!result) return false

    return result
  }

  async removeBookmarkByTweet({ user_id, tweet_id }: BookmarkConstructor) {
    if (!tweet_id || !user_id) return false

    const result = await findAndDeleteBookmarkByTweet(new Bookmark({ tweet_id, user_id }))

    if (!result) return false

    return result
  }

  async removeBookmarkById(bookmark_id: string) {
    if (!bookmark_id) return false

    const result = await findAndDeleteBookmarkById(bookmark_id)

    if (!result) return false

    return result
  }
}

export default new bookmarkServices()
