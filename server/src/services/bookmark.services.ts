import Bookmark, { BookmarkConstructor } from '~/models/schemas/bookmark.schema'
import { insertOneBookmarkTweet } from '~/repository/bookmark.repository'

class bookmarkServices {
  async bookmarkTweet({ user_id, tweet_id }: BookmarkConstructor) {
    if (!tweet_id || !user_id) return false

    const result = await insertOneBookmarkTweet(new Bookmark({ tweet_id, user_id }))

    if (!result) return false

    return result
  }
}

export default new bookmarkServices()
