import { isEmpty } from 'lodash'
import { SearchRequestQuery } from '~/models/requests/Search.request'
import { combinedSearchTweets } from '~/repository/search.repository'
class SearchServices {
  async searchTweets({ q, f, pf, page, limit, user_id }: SearchRequestQuery & { user_id: string }) {
    const result = await combinedSearchTweets({ q, f, pf, page, limit, user_id })

    if (isEmpty(result)) {
      return null
    }

    return result
  }
}

export default new SearchServices()
