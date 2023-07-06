import { UserDataType } from '@farcaster/hub-nodejs'
import log from '@kengoldfarb/log'
import { sql } from 'kysely'
import uniq from 'lodash/uniq'
import { DateTime } from 'luxon'
import type { NextApiRequest, NextApiResponse } from 'next'
import db, { Database } from '../../../server/db'

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
		const hash = (req.query.hash as string) ?? null
		const parentHash = (req.query.parentHash as string) ?? null
		const parentUrl = (req.query.parentUrl as string) ?? null
		const after = (req.query.after as string) ?? null
		// console.log({ parentUrl, query: req.query })
		let castsPromise = db
			.selectFrom('casts')
			.selectAll(['casts'])
			.select([sql<string>`ENCODE(hash::bytea, 'hex')`.as('hash')])
			.select([sql<string>`DATE_PART('epoch', timestamp)`.as('timestamp')])
			.select([sql<string>`ENCODE(parent_hash::bytea, 'hex')`.as('parentHash')])

		if (hash) {
			castsPromise = castsPromise.where(
				'casts.hash',
				'=',
				Uint8Array.from(Buffer.from(hash, 'hex'))
			)
		}

		if (parentHash) {
			castsPromise = castsPromise.where(
				'casts.parentHash',
				'=',
				Uint8Array.from(Buffer.from(parentHash, 'hex'))
			)
		}

		if (parentUrl) {
			castsPromise = castsPromise.where('casts.parentUrl', '=', parentUrl)
		}

		if (!hash && !parentHash && !parentUrl) {
			castsPromise = castsPromise.where('casts.parentUrl', 'is not', null)
		}

		if (after) {
			const a = DateTime.fromSeconds(+after).toJSDate()
			castsPromise = castsPromise.where('casts.timestamp', '<', a)
		}

		castsPromise = castsPromise
			// .where('casts.id', '=', 549206)
			.orderBy('casts.timestamp', 'desc')
			.limit(25)

		const casts = await castsPromise.execute()

		if (casts.length === 0) {
			return res.json({ casts: [] })
		}

		let fids: number[] = []
		let parentHashes: Uint8Array[] = []
		const castHashes: Uint8Array[] = []
		casts.forEach(c => {
			castHashes.push(Uint8Array.from(Buffer.from(c.hash, 'hex')))
			if (c.parentHash) {
				parentHashes.push(c.parentHash)
			}
			fids.push(c.fid)
		})
		fids = uniq(fids)
		parentHashes = uniq(parentHashes)

		// console.log({ fids, parentHashes, castHashes })

		const [userData, replies, reactions] = await Promise.all([
			db.selectFrom('userData').selectAll().where('fid', 'in', fids).execute(),
			db
				.selectFrom('casts')
				.selectAll()
				.select([sql<string>`ENCODE(hash::bytea, 'hex')`.as('hash')])
				.select([
					sql<string>`ENCODE(parent_hash::bytea, 'hex')`.as('parentHash')
				])
				.where('parentHash', 'in', castHashes)
				.orderBy('casts.timestamp', 'desc')
				.execute(),
			db
				.selectFrom('reactions')
				.selectAll()
				.select([
					sql<string>`ENCODE(target_hash::bytea, 'hex')`.as('targetHash')
				])
				.select([sql<string>`ENCODE(hash::bytea, 'hex')`.as('hash')])
				.where('targetHash', 'in', castHashes)
				.execute()
		])
		// console.log({ userData, replies, reactions })
		const users: {
			[fid: number]: IUserData
		} = {}

		userData.forEach(ud => {
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

		casts.forEach(c => {
			c.user = users[c.fid]
			c.reactions = reactions.filter(r => r.targetHash === c.hash)
			c.replies = replies.filter(r => r.parentHash === c.hash)
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
