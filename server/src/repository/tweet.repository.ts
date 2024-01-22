import { Document, ObjectId } from 'mongodb'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'

export const insertOneTweet = async (tweet: Tweet) => {
  const result = await databaseService.tweets.insertOne(tweet)
  return result
}

export const findTweetById = async (tweet_id: string, projection?: Document) => {
  const result = await databaseService.tweets.findOne({ _id: new ObjectId(tweet_id) }, { projection: projection })
  return result
}
