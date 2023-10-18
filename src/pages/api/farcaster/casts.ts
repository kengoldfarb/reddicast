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
		const hash = (req.query.hash as string) ?? null
		const parentHash = (req.query.parentHash as string) ?? null
		const parentUrl = (req.query.parentUrl as string) ?? null
		const after = (req.query.after as string) ?? null
		const fname = (req.query.fname as string) ?? null
		const mode = (req.query.mode as string) ?? null
		let fid: number | undefined
		if (fname) {
			const ud = await db
				.selectFrom('userData')
				.select(['fid'])
				.where('value', '=', fname)
				.where('type', '=', UserDataType.USERNAME)
				.execute()

			if (!ud || !ud[0]) {
				throw new Error('USER_NOT_FOUND')
			}

			fid = ud[0].fid
		}

		// console.log({ parentUrl, query: req.query })
		let castsPromise = db
			.selectFrom('casts')
			.selectAll(['casts'])
			.select([sql<string>`ENCODE(hash::bytea, 'hex')`.as('hash')])
			.select([sql<string>`DATE_PART('epoch', timestamp)`.as('timestamp')])
			.select([sql<string>`ENCODE(parent_hash::bytea, 'hex')`.as('parentHash')])

		if (fid) {
			castsPromise = castsPromise.where('casts.fid', '=', fid)
		}

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

		if (parentUrl === 'popular') {
			let mostReactionsPromise = db
				.selectFrom('reactions')
				.select('targetHash')
				.select([sql<string>`COUNT(target_hash)`.as('numReactions')])
				.where('timestamp', '>', DateTime.now().minus({ days: 60 }).toJSDate())
				.groupBy('targetHash')
				.orderBy('numReactions', 'desc')

			if (after) {
				const a = DateTime.fromSeconds(+after).toJSDate()
				mostReactionsPromise = mostReactionsPromise.where(
					'reactions.timestamp',
					'<',
					a
				)
			}
			const mostReactions = await mostReactionsPromise.limit(25).execute()
			if (mostReactions.length > 0) {
				castsPromise = castsPromise.where(
					'casts.hash',
					'in',
					mostReactions.map(r => r.targetHash)
				)
			}
		} else if (parentUrl) {
			castsPromise = castsPromise.where('casts.parentUrl', '=', parentUrl)
		}

		if (!hash && !parentHash && !parentUrl && !fid) {
			castsPromise = castsPromise.where('casts.parentUrl', 'is not', null)
		}

		if (mode === 'submitted') {
			castsPromise = castsPromise.where('casts.parentHash', 'is', null)
		} else if (mode === 'comments') {
			castsPromise = castsPromise.where('casts.parentHash', 'is not', null)
		}

		if (after) {
			const a = DateTime.fromSeconds(+after).toJSDate()
			castsPromise = castsPromise.where('casts.timestamp', '<', a)
		}

		castsPromise = castsPromise.orderBy('casts.timestamp', 'desc').limit(25)

		const casts = await castsPromise.execute()

		if (casts.length === 0) {
			return res.json({ casts: [] })
		}

		let fids: number[] = []
		let parentHashes: Uint8Array[] = []
		const castHashes: Uint8Array[] = []
		let mentionFIDs: number[] = []
		casts.forEach(c => {
			castHashes.push(Uint8Array.from(Buffer.from(c.hash, 'hex')))
			if (c.parentHash) {
				parentHashes.push(c.parentHash)
			}
			fids.push(c.fid)

			if (c.mentions) {
				mentionFIDs.push(...c.mentions)
			}
		})
		fids = uniq(fids)
		mentionFIDs = uniq(mentionFIDs)
		parentHashes = uniq(parentHashes)

		const [userData, replies, reactions, mentionedUsersData] =
			await Promise.all([
				fids.length > 0
					? db
							.selectFrom('userData')
							.selectAll()
							.where('fid', 'in', fids)
							.execute()
					: Promise.resolve(null),
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
					.execute(),
				mentionFIDs.length > 0
					? db
							.selectFrom('userData')
							.selectAll()
							.where('fid', 'in', mentionFIDs)
							.execute()
					: Promise.resolve([])
			])
		// console.log({ userData, replies, reactions })
		const users: {
			[fid: number]: IUserData
		} = {}
		const mentionedUsers: {
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

				case UserDataType.USERNAME:
					users[ud.fid].fname = ud.value
					break
			}
		})

		mentionedUsersData.forEach(ud => {
			if (!mentionedUsers[ud.fid]) {
				mentionedUsers[ud.fid] = {}
			}
			switch (ud.type) {
				case UserDataType.PFP:
					mentionedUsers[ud.fid].pfp = ud.value
					break

				case UserDataType.DISPLAY:
					mentionedUsers[ud.fid].displayName = ud.value
					break

				case UserDataType.BIO:
					mentionedUsers[ud.fid].bio = ud.value
					break

				case UserDataType.URL:
					mentionedUsers[ud.fid].url = ud.value
					break

				case UserDataType.USERNAME:
					mentionedUsers[ud.fid].fname = ud.value
					break
			}
		})

		casts.forEach(c => {
			c.user = users[c.fid]
			c.reactions = reactions.filter(r => r.targetHash === c.hash)
			c.replies = replies.filter(r => r.parentHash === c.hash)
			c.mentionedUsers = []
			c.mentions.forEach(m => {
				c.mentionedUsers.push(mentionedUsers[m])
			})
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
