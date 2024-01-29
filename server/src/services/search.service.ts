import { config } from 'dotenv'
import { isEmpty } from 'lodash'
import { SearchRequestQuery } from '~/models/requests/Search.request'
import { findTweetsByContent } from '~/repository/search.repository'

config()

class SearchServices {
  async searchTweetsByContent({ q, page, limit, user_id }: SearchRequestQuery & { user_id: string }) {
    const result = await findTweetsByContent({ q, page, limit, user_id })

    if (isEmpty(result)) {
      return null
    }

    return result
  }
}

export default new SearchServices()
