import { Document, ObjectId, WithId } from 'mongodb'
import { SearchRequestQuery } from '~/models/requests/Search.request'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.service'
import { compileTweetDetails, getTweetsByFollowedUserIds, paginationStage } from './tweets.repository'
import { MediaRequestQuery, MediaType } from '~/constant/enum'
import userService from '~/services/user.service'

export const combinedSearchTweets = async ({
  q,
  f,
  pf,
  page,
  limit,
  user_id
}: SearchRequestQuery & { user_id: string }): Promise<Tweet[] | null> => {
  const result = await databaseService.tweets
    .aggregate<Tweet>(await searchTweetsAggregate({ q, f, pf, page, limit, user_id }))
    .toArray()

  return result
}

const searchTweetsAggregate = async ({
  q,
  f,
  pf,
  page,
  limit,
  user_id
}: SearchRequestQuery & { user_id: string }): Promise<Document[]> => [
  ...(await combinedFilterTweets({ q, f, pf, user_id })),
  ...paginationStage({ page: Number(page), limit: Number(limit) }),
  ...compileTweetDetails()
]

const combinedFilterTweets = async ({
  q,
  f,
  pf,
  user_id
}: Omit<SearchRequestQuery, 'page' | 'limit'> & { user_id: string }): Promise<Document[]> => {
  // Khởi tạo match bằng object rỗng
  const $match: Document = {}

  // Nếu có q (lọc tweet bằng text) truyền vào bằng request thì thêm điều kiện cho $match
  if (q) {
    $match.$text = { $search: q }
  }

  // Nếu có f (lọc media) truyền vào bằng request thì thêm điều kiện cho $match
  if (f) {
    if (f === MediaRequestQuery.Image) {
      $match['medias.type'] = MediaType.Image
    }
    if (f === MediaRequestQuery.Video) {
      $match['medias.type'] = {
        $in: [MediaType.Video, MediaType.HLS]
      }
    }
  }

  // Nếu có pf (lấy tweets từ user đang đăng nhập đã follow) truyền vào bằng request thì thêm điều kiện cho $match
  if (pf && String(pf) === '1') {
    const user_ids = await userService.getFollowedUserIds(user_id, {
      _id: 0,
      followed_user_id: 1
    })

    $match.user_id = {
      $in: user_ids
    }
  }

  return [
    { $match },
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
}

export const countTweetsByAggregate = async ({
  q,
  f,
  pf,
  user_id
}: Omit<SearchRequestQuery, 'page' | 'limit'> & { user_id: string }) => {
  const pipeline = [
    // Tìm kiếm tweets theo text
    ...(await combinedFilterTweets({ q, f, pf, user_id })),
    // Đếm số lượng tweet bằng aggregation
    { $count: 'total_tweets' }
  ]

  const result = await databaseService.tweets.aggregate(pipeline).toArray()
  return result
}
