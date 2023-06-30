import db, { Database } from '../../../server/db'
import { UserDataType } from '@farcaster/hub-nodejs'
import log from '@kengoldfarb/log'
import { sql } from 'kysely'
import uniq from 'lodash/uniq'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface IUserData {
	pfp?: string
	displayName?: string
	bio?: string
	url?: string
	fname?: string
}

export interface IGetCastsResponse {
	casts: (Database['casts'] & {
		user: IUserData
	})[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		// const db = getDbClient(process.env.DATABASE_URL ?? '')
		const _parentHash = (req.query.parentHash as string) ?? null
		const parentUrl = (req.query.parentUrl as string) ?? null
		console.log({ parentUrl, query: req.query })
		const casts = await db
			.selectFrom('casts')
			.selectAll(['casts'])
			.select([sql<string>`ENCODE(hash::bytea, 'hex')`.as('hash')])
			.select([sql<string>`ENCODE(parent_hash::bytea, 'hex')`.as('parentHash')])
			// .where('casts.parentHash', 'is', null)
			.where('casts.parentUrl', parentUrl ? '=' : 'is not', parentUrl ?? null)
			// .where('casts.parentUrl', '=', parentUrl)
			.orderBy('casts.timestamp', 'desc')
			.limit(25)
			.execute()

		if (casts.length === 0) {
			return res.json({ casts: [] })
		}

		let fids: number[] = []
		let parentHashes: Uint8Array[] = []
		const castHashes: Uint8Array[] = []
		casts.forEach((c) => {
			castHashes.push(c.hash)
			if (c.parentHash) {
				parentHashes.push(c.parentHash)
			}
			fids.push(c.fid)
		})
		fids = uniq(fids)
		parentHashes = uniq(parentHashes)

		console.log({ fids, parentHashes })

		const [userData, replies, reactions] = await Promise.all([
			db.selectFrom('userData').selectAll().where('fid', 'in', fids).execute(),
			db.selectFrom('casts').selectAll().where('parentHash', 'in', castHashes).execute(),
			db.selectFrom('reactions').selectAll().where('targetHash', 'in', castHashes).execute()
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
			c.reactions = reactions.filter((r) => r.targetHash === c.hash)
			c.replies = replies.filter((r) => r.parentHash === c.hash)
			// c.hash = new TextDecoder().decode(...c.hash)
		})

		return res.json({
			// reactions,
			// replies,
			casts
		})
	} catch (e) {
		log.crit(e)
		return res.status(500).json({
			status: 'failure'
		})
	}
}
export default handler
