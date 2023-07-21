import { UserDataType } from '@farcaster/hub-nodejs'
import log from '@kengoldfarb/log'
import { sql } from 'kysely'
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
		let fid = req.query.fid ? +req.query.fid : null
		const fname = req.query.fname ?? null

		if (fname) {
			const ud = await db
				.selectFrom('userData')
				.select(['fid'])
				.where('value', '=', fname)
				.where('type', '=', UserDataType.FNAME)
				.execute()

			if (!ud || !ud[0]) {
				throw new Error('USER_NOT_FOUND')
			}

			fid = ud[0].fid
		}

		let query = db
			.selectFrom('userData')
			.selectAll()
			.select([sql<string>`ENCODE(hash::bytea, 'hex')`.as('hash')])

		if (!fid && !fname) {
			throw new Error('MISSING_PARAMETERS')
		}
		if (fid) {
			query = query.where('fid', '=', fid)
		}

		const [userData] = await Promise.all([query.execute()])

		const user: {
			fid: number
			pfp?: string
			displayName?: string
			bio?: string
			url?: string
			fname?: string
		} = {
			fid
		}

		userData.forEach(ud => {
			switch (ud.type) {
				case UserDataType.PFP:
					user.pfp = ud.value
					break
				case UserDataType.DISPLAY:
					user.displayName = ud.value
					break
				case UserDataType.BIO:
					user.bio = ud.value
					break
				case UserDataType.URL:
					user.url = ud.value
					break
				case UserDataType.FNAME:
					user.fname = ud.value
					break

				default:
					break
			}
		})

		return res.json({
			user
		})
	} catch (e) {
		log.crit(e)
		return res.status(500).json({
			status: 'failure'
		})
	}
}
export default handler
