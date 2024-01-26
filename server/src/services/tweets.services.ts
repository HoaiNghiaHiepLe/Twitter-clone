import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import {
  countTweetChildrenByParentIds,
  findAndUpdateManyTweetById,
  findAndUpdateTweetById,
  findTweetById,
  findTweetChildrenByParentId,
  getTweetsByFollowedUserIds,
  insertOneTweet
} from '~/repository/tweets.repository'
import Tweet from '~/models/schemas/Tweet.schema'
import { findOneAndUpdateHashtag } from '~/repository/hashtags.repository'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { IntegerType, ObjectId, OnlyFieldsOfType } from 'mongodb'
import { TweetType } from '~/constant/enum'
import databaseService from './database.services'

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
    const result = await findAndUpdateTweetById(tweet_id, inc, { guest_views: 1, user_views: 1, updated_at: 1 })

    return result as Pick<Tweet, 'guest_views' | 'user_views' | 'updated_at'>
  }

  async increaseManyTweetView(tweets: Tweet[], user_id: string) {
    const tweetIds = tweets.map((tweet) => tweet._id as ObjectId)

    const inc: OnlyFieldsOfType<Tweet, IntegerType> = user_id ? { user_views: 1 } : { guest_views: 1 }

    const date = new Date()

    // Vì updateMany của mongodb không trả về document sau khi update và để lấy lại tất cả tweets đã đc update view thì phải quey lại 1 lần nữa -> tốn tài nguyên nên:

    // Update lại giá trị của tweets truyền vào và trả ra cho client
    tweets.forEach((tweet: Tweet) => {
      tweet.updated_at = date
      if (user_id) {
        ;(tweet.user_views as number) += 1
      } else {
        ;(tweet.guest_views as number) += 1
      }
    })

    // Update view của tất cả tweets trong db
    await findAndUpdateManyTweetById(tweetIds, inc)

    // Trả về tweets đã update view
    return tweets
  }

  async getTweetChildrenByParentId({
    parent_id,
    tweet_type,
    page,
    limit,
    user_id
  }: {
    parent_id: string
    tweet_type: TweetType
    page: number
    limit: number
    user_id: string
  }) {
    const tweets = await findTweetChildrenByParentId({ parent_id, tweet_type, page, limit })

    const [tweetChildren, totalTweets] = await Promise.all([
      this.increaseManyTweetView(tweets, String(user_id)),
      countTweetChildrenByParentIds({ parent_id, tweet_type })
    ])

    return { tweets: tweetChildren, totalTweets }
  }

  async getNewsFeed({
    user_id,
    user_ids,
    page,
    limit
  }: {
    user_id: string
    user_ids: ObjectId[]
    page: number
    limit: number
  }) {
    const newsFeed = await getTweetsByFollowedUserIds({ user_id, user_ids, page, limit })
    return newsFeed
  }
}

const tweetServices = new TweetServices()
export default tweetServices
