import Tweet from '~/models/schemas/Tweets.schema'
import User from '~/models/schemas/Users.schema'

//type of response when get newfeed of user
export type NewFeed = Tweet & {
  user: User
  bookmarks: number
  likes: number
  retweets: number
  comments: number
}

// type of response when get tweet by id
export type TweetDetail = Tweet & {
  bookmarks: number
  likes: number
  retweets: number
  comments: number
  quotes: number
}
