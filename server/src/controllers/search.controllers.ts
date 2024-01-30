import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { config } from 'dotenv'
import { MESSAGE } from '~/constant/message'
import { interpolateMessage } from '~/utils/utils'
import { SearchRequestQuery } from '~/models/requests/Search.request'
import searchService from '~/services/search.service'
import tweetServices from '~/services/tweets.service'
import { countTweetsByAggregate } from '~/repository/search.repository'

config()

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchRequestQuery>, res: Response) => {
  const { q, f, pf, page, limit } = req.query
  const user_id = req.decoded_authorization?.user_id as string

  const tweets = await searchService.searchTweets({
    q,
    f,
    pf,
    page,
    limit,
    user_id
  })

  if (!tweets) {
    return res.json({
      message: interpolateMessage(MESSAGE.NOT_FOUND, { field: 'Tweet' })
    })
  }

  const [updatedTweetsViews, totalTweets] = await Promise.all([
    tweetServices.increaseManyTweetView(tweets, user_id),
    countTweetsByAggregate({ q, f, pf, user_id })
  ])

  return res.json({
    message: interpolateMessage(MESSAGE.SUCCESSFUL, { action: 'Search' }),
    result: {
      tweets: updatedTweetsViews,
      page,
      limit,
      total_page: Math.ceil(Number(totalTweets[0]?.total_tweets || 0) / Number(limit))
    }
  })
}
