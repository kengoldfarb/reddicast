import db, { Database } from '../../../server/db'
import { IUserData } from './casts'
import { UserDataType } from '@farcaster/hub-nodejs'
import log from '@kengoldfarb/log'
import { sql } from 'kysely'
import uniq from 'lodash/uniq'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface IGetSubredditResponse {
	casts: (Database['casts'] & {
		user: IUserData
	})[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const parentUrl = req.query.parentUrl as string

		// const db = getDbClient(process.env.DATABASE_URL ?? '')

		console.log({ parentUrl })

		const [info, firstCast] = await Promise.all([
			db
				.selectFrom('casts')
				.where('casts.parentUrl', '=', parentUrl)
				.select(({ fn }) => [fn.count<number>('casts.id').as('numCasts')])
				.execute(),
			db
				.selectFrom('casts')
				.where('casts.parentUrl', '=', parentUrl)
				.orderBy('casts.timestamp', 'asc')
				.selectAll(['casts'])
				.select([sql<string>`ENCODE(hash::bytea, 'hex')`.as('hash')])
				.select([sql<string>`ENCODE(parent_hash::bytea, 'hex')`.as('parentHash')])
				.executeTakeFirst()
		])

		return res.json({
			numCasts: info[0].numCasts,
			firstCast
		})
	} catch (e) {
		log.crit(e)
	}
}
export default handler
