import { ObjectId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import databaseService from '~/services/database.services'

export const findOneAndUpdateHashtag = async (hashtag: Hashtag) => {
  // Tìm hashtag trong database, nếu không có thì tạo mới
  const result = await databaseService.hashtags.findOneAndUpdate(
    {
      name: hashtag.name
    },
    {
      // Phải set _id on insert vì nếu không sẽ bị lỗi duplicate key vì _id là null
      $setOnInsert: new Hashtag({ name: hashtag.name, _id: new ObjectId() })
    },
    {
      upsert: true,
      // Trả về document sau khi update
      // Trước khi update nếu tìm k ra document thì sẽ trả về null
      returnDocument: 'after'
    }
  )

  return result
}
