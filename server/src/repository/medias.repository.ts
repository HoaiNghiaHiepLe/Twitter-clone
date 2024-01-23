import VideoEncodingStatus from '~/models/schemas/videoStatus.chema'
import databaseService from '~/services/database.services'

export const insertVideoEncodingStatus = async ({
  name,
  status,
  notification,
  created_at,
  updated_at
}: VideoEncodingStatus) => {
  const filter = { name: name }
  const update = {
    $set: { status: status, notification: notification, updated_at: updated_at },
    $setOnInsert: { created_at: created_at }
  }
  const options = { upsert: true }

  const result = await databaseService.videoEncodingStatus.updateOne(filter, update, options)

  return result
}

export const findVideoEncoding = async (
  name: Pick<VideoEncodingStatus, 'name'>
): Promise<VideoEncodingStatus | null> => {
  const result = await databaseService.videoEncodingStatus.findOne({ name: name })
  if (!result) {
    return null
  }
  return result
}
