import { Document, IntegerType, ObjectId, OnlyFieldsOfType } from 'mongodb'
import { TweetType } from '~/constant/enum'
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
              $eq: ['$$item.type', TweetType.Retweet]
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
              $eq: ['$$item.type', TweetType.Comment]
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
              $eq: ['$$item.type', TweetType.QuoteTweet]
            }
          }
        }
      }
    }
  },
  {
    $project: {
      tweet_children: 0
    }
  }
]

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

export const findTweetChildrenByParentId = async ({
  parent_id,
  tweet_type,
  page,
  limit
}: {
  parent_id: string
  tweet_type: TweetType
  page: number
  limit: number
}) => {
  const tweets = await databaseService.tweets
    // Truyền Tweet vào generic type của aggregate để trả về Tweet[]
    .aggregate<Tweet>(tweetChildrenAggregate({ parent_id, tweet_type, page, limit }))
    // chuyển AggregationCursor<Document> thành Document[]
    .toArray()

  const total = await databaseService.tweets.countDocuments({
    parent_id: new ObjectId(parent_id),
    type: tweet_type
  })

  return { tweets, total }
}

const tweetChildrenAggregate = ({
  parent_id,
  tweet_type,
  page,
  limit
}: {
  parent_id: string
  tweet_type: TweetType
  page: number
  limit: number
}): Document[] => [
  {
    $match: {
      parent_id: new ObjectId(parent_id),
      type: tweet_type
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
              $eq: ['$$item.type', TweetType.Retweet]
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
              $eq: ['$$item.type', TweetType.Comment]
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
              $eq: ['$$item.type', TweetType.QuoteTweet]
            }
          }
        }
      }
    }
  },
  {
    $project: {
      tweet_children: 0
    }
  },
  {
    // Trang hiện tại
    $skip: limit * (page - 1) // Công thưc phân trang
  },
  {
    // Số lượng bản ghi mỗi trang
    $limit: limit
  }
]
