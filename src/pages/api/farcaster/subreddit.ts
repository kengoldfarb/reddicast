import { Database, getDbClient } from '../../../server/db'
import { IUserData } from './casts'
import { UserDataType } from '@farcaster/hub-nodejs'
import log from '@kengoldfarb/log'
import uniq from 'lodash/uniq'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface IGetSubredditResponse {
	casts: (Database['casts'] & {
		user: IUserData
	})[]
}

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
	try {
		console.log({ query: req.query })
		const db = getDbClient(process.env.DATABASE_URL ?? '')
		const casts = await db
			.selectFrom('casts')
			.selectAll(['casts'])
			.where('casts.parentHash', 'is', null)
			.where('casts.parentUrl', 'is not', null)
			.orderBy('casts.timestamp', 'desc')
			.limit(25)
			.execute()

		let fids: number[] = []
		let parentHashes: Uint8Array[] = []
		casts.forEach((c) => {
			if (c.parentHash) {
				parentHashes.push(c.parentHash)
			}
			fids.push(c.fid)
		})
		fids = uniq(fids)
		parentHashes = uniq(parentHashes)

		console.log({ fids, parentHashes })

		const [userData, replies] = await Promise.all([
			db.selectFrom('userData').selectAll().where('fid', 'in', fids).execute(),
			parentHashes.length > 0
				? db.selectFrom('casts').selectAll().where('parentHash', 'in', parentHashes).execute()
				: Promise.resolve([])
		])
		const users: {
			[fid: number]: IUserData
		} = {}

		userData.forEach((ud) => {
			if (!users[ud.fid]) {
				users[ud.fid] = {}
			}
			switch (ud.type) {
				case UserDataType.PFP:
					users[ud.fid].pfp = ud.value
					break

				case UserDataType.DISPLAY:
					users[ud.fid].displayName = ud.value
					break

				case UserDataType.BIO:
					users[ud.fid].bio = ud.value
					break

				case UserDataType.URL:
					users[ud.fid].url = ud.value
					break

				case UserDataType.FNAME:
					users[ud.fid].fname = ud.value
					break
			}
		})

		casts.forEach((c) => {
			c.user = users[c.fid]
			// c.hash = new TextDecoder().decode(...c.hash)
		})

		return res.json({
			replies,
			casts
		})
	} catch (e) {
		log.crit(e)
	}
}
export default handler
