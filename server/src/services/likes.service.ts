import Bookmark, { BookmarkConstructor } from '~/models/schemas/Bookmarks.schema'
import { findAndDeleteTweetLike, insertOneTweetLike } from '~/repository/likes.repository'

class likeServices {
  async likeTweet({ user_id, tweet_id }: BookmarkConstructor) {
    if (!tweet_id || !user_id) return false

    const result = await insertOneTweetLike(new Bookmark({ tweet_id, user_id }))

    if (!result) return false

    return result
  }

  async unlikeTweet({ user_id, tweet_id }: BookmarkConstructor) {
    if (!tweet_id || !user_id) return false

    const result = await findAndDeleteTweetLike(new Bookmark({ tweet_id, user_id }))

    if (!result) return false

    return result
  }
}

export default new likeServices()
