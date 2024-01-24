import { Document, ObjectId } from 'mongodb'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'

export const insertOneTweet = async (tweet: Tweet) => {
  const result = await databaseService.tweets.insertOne(tweet)
  return result
}

export const findTweetById = async (tweet_id: string) => {
  const result = await databaseService.tweets
    // Truyền Tweet vào generic type của aggregate để trả về Tweet[]
    .aggregate<Tweet>(tweetDetailAggregate(tweet_id))
    // chuyển AggregationCursor<Document> thành Document[]
    .toArray()

  return result
}

const tweetDetailAggregate = (tweet_id: string): Document[] => [
  {
    $match: {
      _id: new ObjectId(tweet_id)
    }
  },
  {
    $lookup: {
      from: 'hashtags',
      localField: 'hashtags',
      foreignField: '_id',
      as: 'hashtags'
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'mentions',
      foreignField: '_id',
      as: 'mentions'
    }
  },
  {
    $addFields: {
      mentions: {
        $map: {
          input: '$mentions',
          as: 'mention',
          in: {
            _id: '$$mention._id',
            name: '$$mention.name',
            username: '$$mention.name',
            email: '$$mention.email'
          }
        }
      },
      hashtags: {
        $map: {
          input: '$hashtags',
          as: 'hashtag',
          in: {
            _id: '$$hashtag._id',
            name: '$$hashtag.name'
          }
        }
      }
    }
  },
  {
    $lookup: {
      from: 'bookmarks',
      localField: '_id',
      foreignField: 'tweet_id',
      as: 'bookmarks'
    }
  },
  {
    $lookup: {
      from: 'likes',
      localField: '_id',
      foreignField: 'tweet_id',
      as: 'likes'
    }
  },
  {
    $lookup: {
      from: 'tweets',
      localField: '_id',
      foreignField: 'parent_id',
      as: 'tweet_children'
    }
  },
  {
    $addFields: {
      likes: {
        $size: '$likes'
      },
      bookmarks: {
        $size: '$bookmarks'
      },
      retweets: {
        $size: {
          $filter: {
            input: '$tweet_children',
            as: 'item',
            cond: {
              $eq: ['$$item.type', 1]
            }
          }
        }
      },
      comments: {
        $size: {
          $filter: {
            input: '$tweet_children',
            as: 'item',
            cond: {
              $eq: ['$$item.type', 2]
            }
          }
        }
      },
      quotes: {
        $size: {
          $filter: {
            input: '$tweet_children',
            as: 'item',
            cond: {
              $eq: ['$$item.type', 3]
            }
          }
        }
      },
      total_view: {
        $add: ['$guest_views', '$user_views']
      }
    }
  },
  {
    $project: {
      tweet_children: 0
    }
  }
]
