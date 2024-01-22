import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import { findTweetById, insertOneTweet } from '~/repository/tweet.repository'
import Tweet from '~/models/schemas/Tweet.schema'

config()

class TweetServices {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const result = await insertOneTweet(
      new Tweet({
        user_id: user_id,
        type: body.type,
        audience: body.audience,
        content: body.content,
        hashtags: [],
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id
      })
    )

    // Trả về tweet vừa tạo
    const tweet = await findTweetById(String(result.insertedId), {
      _id: 1
    })

    return tweet
  }
  async getTweetById(tweet_id: string) {
    const result = await findTweetById(tweet_id)
    return result
  }
}

const tweetServices = new TweetServices()
export default tweetServices
