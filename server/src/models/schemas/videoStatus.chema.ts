import { ObjectId } from 'mongodb'
import { EncodingStatus } from '~/constant/enum'

interface videoStatusType {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  notification?: string
  created_at?: Date
  updated_at?: Date
}

export default class VideoEncodingStatus {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  notification?: string
  created_at?: Date
  updated_at?: Date

  constructor({ _id, name, status, notification, created_at, updated_at }: videoStatusType) {
    this._id = _id
    this.name = name
    this.status = status
    this.notification = notification
    this.created_at = created_at || new Date()
    this.updated_at = updated_at || new Date()
  }
}
