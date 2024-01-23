import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import { findTweetById, insertOneTweet } from '~/repository/tweets.repository'
import Tweet from '~/models/schemas/Tweet.schema'
import { findOneAndUpdateHashtag } from '~/repository/hashtags.repository'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { ObjectId } from 'mongodb'

config()

class TweetServices {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => findOneAndUpdateHashtag(new Hashtag({ name: hashtag })))
    )
    const hashtagIds = hashtagDocuments.map((hashtagDocument) => hashtagDocument?._id)

    return hashtagIds
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtagIds = await this.checkAndCreateHashtag(body.hashtags)
    const result = await insertOneTweet(
      new Tweet({
        user_id: user_id,
        type: body.type,
        audience: body.audience,
        content: body.content,
        hashtags: hashtagIds as ObjectId[],
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id
      })
    )

    // Trả về tweet vừa tạo
    const tweet = await findTweetById(String(result.insertedId))

    return tweet
  }
  async getTweetById(tweet_id: string) {
    const result = await findTweetById(tweet_id)
    return result
  }
}

const tweetServices = new TweetServices()
export default tweetServices
