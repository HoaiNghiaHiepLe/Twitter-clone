import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import {
  findAndUpdateTweetById,
  findTweetById,
  findTweetChildrenByParentId,
  insertOneTweet
} from '~/repository/tweets.repository'
import Tweet from '~/models/schemas/Tweet.schema'
import { findOneAndUpdateHashtag } from '~/repository/hashtags.repository'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { IntegerType, ObjectId, OnlyFieldsOfType } from 'mongodb'
import { TweetType } from '~/constant/enum'

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

  async increaseTweetView(tweet_id: string, user_id: string) {
    // inc là object chứa các field cần tăng giá trị
    // Nếu user_id tồn tại thì tăng giá trị user_views, ngược lại tăng giá trị guest_views
    const inc: OnlyFieldsOfType<Tweet, IntegerType> = user_id ? { user_views: 1 } : { guest_views: 1 }
    // Gọi hàm findAndUpdateTweetById để tăng giá trị view
    const result = await findAndUpdateTweetById(tweet_id, inc, { guest_views: 1, user_views: 1 })

    return result as Pick<Tweet, 'guest_views' | 'user_views'>
  }

  async getTweetChildrenByParentId({
    parent_id,
    tweet_type,
    page,
    limit
  }: {
    parent_id: string
    tweet_type: TweetType
    page: number
    limit: number
  }) {
    const result = await findTweetChildrenByParentId({ parent_id, tweet_type, page, limit })
    return result
  }
}

const tweetServices = new TweetServices()
export default tweetServices
