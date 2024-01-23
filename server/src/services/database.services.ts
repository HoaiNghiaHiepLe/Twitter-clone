import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoEncodingStatus from '~/models/schemas/videoStatus.chema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/bookmark.schema'

config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.juksne5.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  //? Đánh index cho các collection để tăng tốc độ tìm kiếm
  async indexUser() {
    // Check nếu đã có index thì return
    const exist = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if (exist) {
      return
    }
    this.users.createIndex({ email: 1, password: 1 })
    this.users.createIndex({ email: 1 }, { unique: true })
    this.users.createIndex({ username: 1 }, { unique: true })
  }

  async indexRefreshToken() {
    // Check nếu đã có index thì return
    const exist = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (exist) {
      return
    }
    this.refreshTokens.createIndex({ token: 1 })
    this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  async indexVideoStatus() {
    // Check nếu đã có index thì return
    const exist = await this.videoEncodingStatus.indexExists(['name_1'])
    if (exist) {
      return
    }
    this.videoEncodingStatus.createIndex({ name: 1 })
  }

  async indexFollower() {
    // Check nếu đã có index thì return
    const exist = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (exist) {
      return
    }
    this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get videoEncodingStatus(): Collection<VideoEncodingStatus> {
    return this.db.collection(process.env.DB_VIDEO_ENCODING_STATUS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()

export default databaseService
