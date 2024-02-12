import { Document, IntegerType, ObjectId, OnlyFieldsOfType } from 'mongodb'
import { TweetType } from '~/constant/enum'
import Tweet from '~/models/schemas/Tweets.schema'
import User from '~/models/schemas/Users.schema'
import databaseService from '~/services/database.service'
import { NewFeed, TweetDetail } from '~/types/Tweet.type'

export const insertOneTweet = async (tweet: Tweet) => {
  const result = await databaseService.tweets.insertOne(tweet)
  return result
}

export const findTweetById = async (tweet_id: string): Promise<TweetDetail[]> => {
  const result = await databaseService.tweets
    // Truyền Tweet vào generic type của aggregate để trả về Tweet[]
    .aggregate<TweetDetail>(tweetDetailAggregate(tweet_id))
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
      //$currentDate đc tính từ lúc mongodb chạy
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

export const findAndUpdateManyTweetById = async (tweet_ids: ObjectId[], inc: OnlyFieldsOfType<Tweet, IntegerType>) => {
  // date đc tính từ lúc code server chạy
  const date = new Date()
  const results = await databaseService.tweets.updateMany(
    {
      _id: {
        $in: tweet_ids
      }
    },
    {
      $inc: inc,
      // Phải dùng $set để set giá trị cho updated_at của các documents thay vì dùng $currentDate vì hàm updateMany k returnDocument nên k thể lấy ra đc updated_at của các documents sau khi update
      // Vì vậy tạo date bằng new Date() và set cho updated_at của các documents đồng thời date này cũng sẽ dùng để update lại giá trị updated_at của tweet trả về cho client
      $set: {
        updated_at: date
      }
    }
  )

  return results
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
}): Promise<TweetDetail[]> => {
  const tweetChildren = await databaseService.tweets
    // Truyền Tweet vào generic type của aggregate để trả về Tweet[]
    .aggregate<TweetDetail>(tweetChildrenAggregate({ parent_id, tweet_type, page, limit }))
    // chuyển AggregationCursor<Document> thành Document[]
    .toArray()

  return tweetChildren
}

export const countTweetChildrenByParentIds = async ({
  parent_id,
  tweet_type
}: {
  parent_id: string
  tweet_type: TweetType
}) => {
  const result = await databaseService.tweets.countDocuments({
    parent_id: new ObjectId(parent_id),
    type: tweet_type
  })

  return result
}

export const countNewsFeedByAggregate = async ({ user_ids, user_id }: { user_ids: ObjectId[]; user_id: ObjectId }) => {
  const pipeline = [
    ...newsFeedFilter({ user_ids, user_id }),
    {
      // Đếm số lượng tweet bằng aggregation
      $count: 'total_tweets'
    }
  ]

  const result = await databaseService.tweets.aggregate(pipeline).toArray()

  return result
}

export const getTweetsByFollowedUserIds = async ({
  user_id,
  user_ids,
  page,
  limit
}: {
  user_id: string
  user_ids: ObjectId[]
  page: number
  limit: number
}): Promise<NewFeed[]> => {
  const tweets = await databaseService.tweets
    // Truyền Tweet vào generic type của aggregate để trả về Tweet[]
    .aggregate<NewFeed>(newsFeedAggregate({ user_id: new ObjectId(user_id), user_ids, page, limit }))
    // chuyển AggregationCursor<Document> thành Document[]
    .toArray()

  return tweets
}

const tweetDetailAggregate = (tweet_id: string): Document[] => [
  {
    $match: {
      _id: new ObjectId(tweet_id)
    }
  },
  ...compileTweetDetails(),
  {
    $project: {
      tweet_children: 0
    }
  }
]

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
  // Phân trang
  // Nên để phân trang ở đây để tối ưu data cần phải thực hiện ở các stage sau, lưu ý phải để phân trang sau khi thực hiện $match cuối cùng để đảm bảo đúng số lượng tweet trả về
  ...paginationStage({ page, limit }),
  // Modify lại field của tweet
  ...compileTweetDetails(),
  {
    $project: {
      tweet_children: 0
    }
  }
]

const newsFeedAggregate = ({
  user_id,
  user_ids,
  page,
  limit
}: {
  user_id: ObjectId
  user_ids: ObjectId[]
  page: number
  limit: number
}): Document[] => [
  // Tìm tất cả tweet của user đang đăng nhập và user mà user đang đăng nhập đã follow
  ...newsFeedFilter({ user_ids, user_id }),
  // Phân trang
  // Nên để phân trang ở đây để tối ưu data cần phải thực hiện ở các stage sau, lưu ý phải để phân trang sau khi thực hiện $match cuối cùng để đảm bảo đúng số lượng tweet trả về
  ...paginationStage({ page, limit }),
  // Modify lại field của tweet
  ...compileTweetDetails(),
  {
    $project: {
      // Loai bỏ các field không cần thiết
      tweet_children: 0,
      user: {
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0,
        twitterCircle: 0,
        date_of_birth: 0
      }
    }
  }
]

const newsFeedFilter = ({ user_ids, user_id }: { user_ids: ObjectId[]; user_id: ObjectId }): Document[] => [
  {
    $match: {
      user_id: {
        $in: user_ids
      }
    }
  },
  // Tìm user của các tweet trên
  {
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user'
    }
  },
  // Convert user từ array thành object
  {
    $unwind: {
      path: '$user'
    }
  },
  // Check điều kiện của các tweet
  // Nếu audiance = 0 thì tweet này dành cho tất cả mọi người
  // Nếu audiance = 1 thì check xem user đang đăng nhập có nằm trong twitterCircle của user đăng tweet hay không
  {
    $match: {
      $or: [
        {
          audience: 0
        },
        {
          $and: [
            {
              audience: 1
            },
            {
              'user.twitterCircle': {
                $in: [user_id]
              }
            }
          ]
        }
      ]
    }
  }
]

export const compileTweetDetails = (): Document[] => [
  // Tìm hashtag của tweet bằng _id của hashtag
  {
    $lookup: {
      from: 'hashtags',
      localField: 'hashtags',
      foreignField: '_id',
      as: 'hashtags'
    }
  },
  // Tìm mention của tweet bằng _id của user
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
        // Map để thay đổi lại field của mảng mentions, chỉ lấy những field cần thiết
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
        // Map để thay đổi lại field của mảng hashtags, chỉ lấy những field cần thiết
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
    // Tìm tweet được lưu vào bookmark bằng tweet_id
    $lookup: {
      // Tìm từ collection bookmarks
      from: 'bookmarks',
      // Lấy ra những document có tweet_id = _id của tweet
      localField: '_id',
      foreignField: 'tweet_id',
      // Lưu kết quả vào field bookmarks
      as: 'bookmarks'
    }
  },
  {
    // Tìm tweet được like bằng tweet_id
    $lookup: {
      from: 'likes',
      localField: '_id',
      foreignField: 'tweet_id',
      as: 'likes'
    }
  },
  {
    // Tìm tweet được retweet bằng tweet_id
    $lookup: {
      from: 'tweets',
      localField: '_id',
      foreignField: 'parent_id',
      as: 'tweet_children'
    }
  },
  {
    $addFields: {
      // Replace field likes và chỉ lấy số lượng phần tử của mảng likes
      likes: {
        $size: '$likes'
      },
      // Replace field bookmarks và chỉ lấy số lượng phần tử của mảng bookmarks
      bookmarks: {
        $size: '$bookmarks'
      },
      // Replace field retweets và chỉ lấy số lượng phần tử của mảng tweet_children có type là retweet
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
      // Replace field comments và chỉ lấy số lượng phần tử của mảng tweet_children có type là comment
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
      // Replace field quotes và chỉ lấy số lượng phần tử của mảng tweet_children có type là quote
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
  }
]

export const paginationStage = ({
  page,
  limit
}: {
  page: number
  limit: number
}): [
  {
    $skip: number
  },
  {
    $limit: number
  }
] => [
  {
    // Trang hiện tại
    $skip: limit * (page - 1) // Công thưc phân trang
  },
  {
    // Số lượng bản ghi mỗi trang
    $limit: limit
  }
]
