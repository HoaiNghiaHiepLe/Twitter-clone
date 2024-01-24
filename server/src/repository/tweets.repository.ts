import { Document, IntegerType, ObjectId, OnlyFieldsOfType } from 'mongodb'
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

export const findAndUpdateTweetById = async (
  tweet_id: string,
  inc: OnlyFieldsOfType<Tweet, IntegerType>,
  projection?: Document
) => {
  const result = await databaseService.tweets.findOneAndUpdate(
    {
      _id: new ObjectId(tweet_id)
    },
    //$inc là operator của mongodb, dùng để tăng giá trị của field truyền vào khi gọi function
    {
      $inc: inc,
      $currentDate: {
        updated_at: true
      }
    },
    {
      returnDocument: 'after',
      projection: projection
    }
  )

  return result
}

const tweetDetailAggregate = (tweet_id: string): Document[] => [
  {
    $match: {
      _id: new ObjectId('65b0c0f63b146d66a58c4e1f')
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
      as: 'tweet_childrent'
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
            input: '$tweet_childrent',
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
            input: '$tweet_childrent',
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
            input: '$tweet_childrent',
            as: 'item',
            cond: {
              $eq: ['$$item.type', 3]
            }
          }
        }
      }
    }
  },
  {
    $project: {
      tweet_childrent: 0
    }
  }
]
