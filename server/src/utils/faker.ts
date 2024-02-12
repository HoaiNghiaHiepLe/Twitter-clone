import { faker } from '@faker-js/faker'
import { ObjectId, WithId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constant/enum'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import { RegisterReqBody } from '~/models/requests/User.request'
import Follower from '~/models/schemas/Followers.schema'
import Hashtag from '~/models/schemas/Hashtags.schema'
import Tweet from '~/models/schemas/Tweets.schema'
import User from '~/models/schemas/Users.schema'
import { checkExistEmail, countUsers } from '~/repository/users.repository'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'

/**
 * Yêu cầu: Phải cài đặt `@faker-js/faker` vào project
 * Cài đặt: `npm i @faker-js/faker`
 */

// Mật khẩu cho các fake users
const PASSWORD = 'Hiep123!'

// Số lượng user được tạo, mỗi user sẽ mặc định tweet 2 cái
const USER_COUNT = 500

// Tạo một user ngẫu nhiên với faker
const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

// Tạo một tweet ngẫu nhiên với faker
const createRandomTweet = () => {
  const tweet: TweetRequestBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: ['NodeJS', 'MongoDB', 'ExpressJS', 'Swagger', 'Docker', 'Socket.io'],
    medias: [
      {
        type: MediaType.Image,
        url: faker.image.url()
      }
    ],
    mentions: [],
    parent_id: null
  }
  return tweet
}

// Tạo một mảng các user ngẫu nhiên
const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

// Insert các users vào database
const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  console.log('Creating users...')
  // Dùng Promise.all để tất cả các user được tạo đồng thời
  const result = await Promise.all(
    users.map(async (user) => {
      // Tạo một ObjectId ngẫu nhiên cho user_id
      const user_id = new ObjectId()
      // Insert từng user vào database
      await databaseService.users.insertOne(
        new User({
          ...user,
          _id: user_id,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth as string),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`Created ${result.length} users`)
  return result
}

// Follow nhiều user với một user
const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Start following...')
  // Dùng Promise.all để tất cả các user được follow đồng thời
  const result = await Promise.all(
    // Dùng map để lặp qua mảng các user_id được follow
    followed_user_ids.map((followed_user_id) =>
      // Insert một follower vào database
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    )
  )
  console.log(`Followed ${result.length} users`)
}

const checkAndCreateHashtags = async (hashtags: string[]) => {
  const hashtagDocuments = await Promise.all(
    hashtags.map((hashtag) => {
      // Tìm hashtag trong database, nếu có thì lấy, không thì tạo mới
      return databaseService.hashtags.findOneAndUpdate(
        { name: hashtag },
        {
          $setOnInsert: new Hashtag({ name: hashtag, _id: new ObjectId() })
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
    })
  )
  return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
}

// Insert một tweet vào database
const insertTweet = async (user_id: ObjectId, body: TweetRequestBody) => {
  // Tìm các hashtag trong database, nếu có thì lấy, không thì tạo mới
  const hashtags = await checkAndCreateHashtags(body.hashtags)
  // Insert tweet vào database
  const result = await databaseService.tweets.insertOne(
    new Tweet({
      audience: body.audience,
      content: body.content,
      hashtags,
      mentions: body.mentions,
      medias: body.medias,
      parent_id: body.parent_id,
      type: body.type,
      user_id: String(user_id)
    })
  )
  return result
}

// Insert nhiều tweet vào database
const insertMultipleTweets = async (ids: ObjectId[]) => {
  console.log('Creating tweets...')
  console.log(`Counting...`)

  let count = 0
  // Dùng Promise.all để tất cả các tweet được tạo đồng thời
  const result = await Promise.all(
    ids.map(async (id, index) => {
      // Mỗi user sẽ mặc định tweet 2 cái
      await Promise.all([insertTweet(id, createRandomTweet()), insertTweet(id, createRandomTweet())])
      count += 2
      console.log(`Created ${count} tweets`)
    })
  )
  return result
}

// Chạy các hàm trên theo thứ tự
// Đầu tiên kiểm tra số lượng user trong database
// Tạo các user
// Sau đó follow các user đó với một user khác
// Sau đó tạo tweet cho các user đó

// ID của tài khoản của mình, dùng để follow người khác
checkExistEmail('hieple.dev.1209@gmail.com')
  .then((me) => {
    const MY_ID = new ObjectId(String(me?._id))

    countUsers()
      .then((userCount) => {
        if (userCount < USER_COUNT) {
          insertMultipleUsers(users).then((ids) => {
            followMultipleUsers(MY_ID, ids).catch((err) => {
              console.error('Error when following users')
              console.log(err)
            })
            insertMultipleTweets(ids)
              .catch((err) => {
                console.error('Error when creating tweets')
                console.log(err)
              })
              .finally(() => {
                console.log('Create tweets done, all process done')
              })
          })
        } else {
          console.log(`User count is greater than ${USER_COUNT}, skipping...`)
        }
      })
      .finally(() => {
        console.log('Count users done')
      })
      .catch((err) => {
        console.error('Error in counting users:', err)
      })
  })
  .finally(() => {
    console.log('Check email done')
  })
  .catch((err) => {
    console.error('Error checking email or user is not exist', err)
  })
