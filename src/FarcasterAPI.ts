import axios from 'axios'
import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'
import request from 'superagent'
import type { Route_Types } from '../types/logs'
import type { IGetCastsResponse } from './pages/api/farcaster/casts'
// let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
// let limitUrl     = "limit=" + limit;
// let afterUrl     = (after == null) ? "" : "&after="+after;
// let countUrl     = (count == 0) ? "" : "&count="+count;
// let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;
// chain://eip155:1/erc721:0xa45662638e9f3bbb7a6fecb4b17853b7ba0f3a60

export const channels: {
	[key: string]: {
		chainId: number
		tokenType: string
		domain: string
		highlight?: string
		domainLink?: string
	}
} = {
	'0xa45662638e9f3bbb7a6fecb4b17853b7ba0f3a60': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Purple',
		highlight: '#8A63D2',
		domainLink:
			'https://nouns.build/dao/ethereum/0xa45662638e9f3bbb7a6fecb4b17853b7ba0f3a60'
	},
	'0xc18f6a34019f5ba0fc5bc8cb6fe52e898d6bbbee': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Books ($BKS)'
	},
	'0xec0ba367a6edf483a252c3b093f012b9b1da8b3f': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Food ($FOOD)'
	},
	'0xc4934dbb7a71f76e4068cd04fade20ad6c0023dd': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Screens ($SCREENS)'
	},
	'0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Memes ($MEME)'
	},
	'0xdf3abf79aedcc085e9a41a569964e9fb53f33728': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Podcasts ($POD)'
	},
	'0xee442da02f2cdcbc0140162490a068c1da94b929': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Fitness ($FIT)'
	},
	'0x8cb43a65b27461b61d6c8989e6f9d88e5426833d': {
		chainId: 7777777,
		tokenType: 'erc721',
		domain: 'Dogs'
	},
	'0x7abfe142031532e1ad0e46f971cc0ef7cf4b98b0': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Soccer ($SOCCER)'
	},
	'0x1538c5ddbb073638b7cd1ae41ec2d9f9a4c24a7e': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Art ($ART)'
	},
	'0x05acde54e82e7e38ec12c5b5b4b1fd1c8d32658d': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Electronic ($ELECTRONIC)'
	},
	'0xca21d4228cdcc68d4e23807e5e370c07577dd152': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Zorbs (ZORB)'
	},
	'0x038adac316a87c29c3acc8641e1d8320bb0144c2': {
		chainId: 7777777,
		tokenType: 'erc721',
		domain: 'Cats'
	},
	'0x427b8efee2d6453bb1c59849f164c867e4b2b376': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'BEB (BEB)'
	},
	'0x37fb80ef28008704288087831464058a4a3940ae': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'EVM ($EVM)'
	},
	'0x7ea3dff0fcd9a203f594c7474f7c6bd098af0427': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Event Pass ($EVENT)'
	},
	'0xc7e230ce8d67b2ad116208c69d616dd6bfc96a8d': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'UnlonelyNFCsV2 (LNLY)'
	},
	'0x7dd4e31f1530ac682c8ea4d8016e95773e08d8b0': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Dev ($FCDEV)'
	},
	'0xfdd5e7949bd72c95907c46a630d2c791f0e842c6': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'NY ($NY)'
	},
	'0x8f0055447ffae257e9025b781643127ca604baaa': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Welcome'
	},
	'0x5fcd7a54fdf08c8dbcb969bc1f021ae87affafa8': {
		chainId: 8453,
		tokenType: 'erc721',
		domain: 'Gigs'
	},
	'0xec30bb189781bbd87478f625d19d9deeeb771964': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'ZK'
	},
	'0x36ef4ed7a949ee87d5d2983f634ae87e304a9ea2': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Photography'
	},
	'0x4f86113fc3e9783cf3ec9a552cbb566716a57628': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'Warpcast'
	},
	'0x5747eef366fd36684e8893bf4fe628efc2ac2d10': {
		chainId: 1,
		tokenType: 'erc721',
		domain: 'AI'
	}
}

export const getDomainInfo = (url?: string) => {
	if (!url || typeof url !== 'string') {
		return {
			domain: '',
			domainLink: '',
			chain: '',
			highlight: ''
		}
	}

	const matches = url
		.toLowerCase()
		.match(/chain:\/\/eip155:(\d+)\/erc\d+:([0-9a-fx]+)/)

	let domain = url
	let domainLink = url
	let chain = null

	let highlight = null

	if (matches && matches[1] && matches[2]) {
		chain = matches[1]
		domain = matches[2]
		switch (chain) {
			case '1':
				domainLink = `https://etherscan.io/address/${domain}`
				break

			case '5':
				domainLink = `https://goerli.etherscan.io/address/${domain}`
				break

			case '137':
				domainLink = `https://polygonscan.com/address/${domain}`
				break

			default:
				domainLink = `/r/${encodeURIComponent(url).toLowerCase()}`
				break
		}
	}

	if (domain && typeof domain === 'string' && domain.length > 0) {
		const d = domain.toLowerCase()
		if (channels[d]) {
			domain = channels[d].domain
			highlight = channels[d].highlight
			domainLink = channels[d].domainLink
		}
	}

	return {
		url,
		domain,
		domainLink,
		chain,
		highlight
	}
}

export const castToPost = (cast?: Record<string, any>) => {
	let score = 0
	cast?.reactions.forEach(r => {
		switch (r.reactionType) {
			case 1:
				score += 1
				break

			case 2:
				score += 10
				break

			default:
				break
		}
	})

	const { domain, domainLink, highlight } = getDomainInfo(cast?.parentUrl)

	const post = {
		kind: 't3',
		data: {
			id: cast.id,
			all_awardings: [],
			author: cast.user.fname,
			title: cast.text,
			body_html: cast.text,
			name: `t3_${cast.id}`,
			score,
			likes: score,
			created_utc: cast.timestamp,
			permalink: cast.parentUrl
				? `/r/${encodeURIComponent(cast.parentUrl)}/comments/${cast.hash}`
				: `/comments/${cast.hash}`,
			domain,
			domain_link: domainLink,
			highlight,
			subreddit: cast.parentUrl,
			subreddit_display_name: domain ?? cast.parentUrl,
			num_comments: cast.replies.length,
			user: cast.user,
			embeds: cast.embeds,
			parentHash: cast.parentHash,
			mentions: cast.mentions,
			mentionsPositions: cast.mentionsPositions,
			mentionedUsers: cast.mentionedUsers
		}
	}
	// console.log({ cast, post })
	return post
}

export const logApiRequest = async (type: Route_Types, isOauth?: boolean) => {}

const getToken = async () => {
	return undefined
}

//trim child data esp for initial SSG
// const _filterPostChildren = children => {
// 	const c = children.map(child => ({
// 		kind: child?.kind,
// 		data: {
// 			all_awardings: child?.data?.all_awardings,
// 			archived: child?.data?.archived,
// 			author: child?.data?.author,
// 			created_utc: child?.data?.created_utc,
// 			crosspost_parent_list: child?.data?.crosspost_parent_list,
// 			distinguished: child?.data?.distinguished,
// 			domain: child?.data?.domain,
// 			downs: child?.data?.downs,
// 			edited: child?.data?.edited,
// 			gallery_data: child?.data?.gallery_data,
// 			hidden: child?.data?.hidden,
// 			hide_score: child?.data?.hide_score,
// 			id: child?.data?.id,
// 			is_self: child?.data?.is_self,
// 			is_video: child?.data?.is_video,
// 			likes: child?.data?.likes,
// 			link_flair_richtext: child?.data?.link_flair_richtext,
// 			link_flair_text: child?.data?.link_flair_text,
// 			link_flair_text_color: child?.data?.link_flair_text_color,
// 			link_flair_background_color: child?.data?.link_flair_background_color,
// 			locked: child?.data?.locked,
// 			media: child?.data?.media,
// 			media_embed: child?.data?.media_embed,
// 			media_only: child?.data?.media_only,
// 			media_metadata: child?.data?.media_metadata,
// 			name: child?.data?.name,
// 			no_follow: child?.data?.no_follow,
// 			num_comments: child?.data?.num_comments,
// 			num_crossposts: child?.data?.num_crossposts,
// 			over_18: child?.data?.over_18,
// 			permalink: child?.data?.permalink,
// 			pinned: child?.data?.pinned,
// 			post_hint: child?.data?.post_hint,
// 			preview: child?.data?.preview,
// 			saved: child?.data?.saved,
// 			score: child?.data?.score,
// 			secure_media: child?.data?.secure_media,
// 			secure_media_embed: child?.data?.secure_media_embed,
// 			selftext: child?.data?.selftext,
// 			selftext_html: child?.data?.selftext_html,
// 			spoiler: child?.data?.spoiler,
// 			sr_detail: {
// 				accept_followers: child?.data?.sr_detail?.accept_followers,
// 				banner_img: child?.data?.sr_detail?.banner_img,
// 				community_icon: child?.data?.sr_detail?.community_icon,
// 				created_utc: child?.data?.sr_detail?.created_utc,
// 				display_name: child?.data?.sr_detail?.display_name,
// 				header_img: child?.data?.sr_detail?.header_img,
// 				icon_img: child?.data?.sr_detail?.icon_img,
// 				key_color: child?.data?.sr_detail?.key_color,
// 				link_flair_position: child?.data?.sr_detail?.link_flair_position,
// 				name: child?.data?.sr_detail?.name,
// 				over_18: child?.data?.sr_detail?.over_18,
// 				primary_color: child?.data?.sr_detail?.primary_color,
// 				public_description: child?.data?.sr_detail?.public_description,
// 				quarantine: child?.data?.sr_detail?.quarantine,
// 				subreddit_type: child?.data?.sr_detail?.subreddit_type,
// 				subscribers: child?.data?.sr_detail?.subscribers,
// 				title: child?.data?.sr_detail?.subscribers,
// 				url: child?.data?.sr_detail?.url,
// 				user_is_banned: child?.data?.sr_detail?.user_is_banned,
// 				user_is_subscriber: child?.data?.sr_detail?.user_is_subscriber
// 			},
// 			stickied: child?.data?.stickied,
// 			subreddit: child?.data?.subreddit,
// 			subreddit_id: child?.data?.subreddit_id,
// 			subreddit_name_prefixed: child?.data?.subreddit_name_prefixed,
// 			subreddit_type: child?.data?.subreddit_type,
// 			suggested_sort: child?.data?.suggested_sort,
// 			thumbnail: child?.data?.thumbnail,
// 			thumbnail_height: child?.data?.thumbnail_height,
// 			thumbnail_width: child?.data?.thumbnail_width,
// 			title: child?.data?.title,
// 			total_awards_received: child?.data?.total_awards_received,
// 			ups: child?.data?.ups,
// 			upvote_ratio: child?.data?.upvote_ratio,
// 			url: child?.data?.url,
// 			url_overridden_by_dest: child?.data?.url_url_overridden_by_dest
// 		}
// 	}))
// 	//~35k byte reduction
// 	//console.log(new Blob([JSON.stringify(children)]).size,new Blob([JSON.stringify(c)]).size); // 38
// 	//console.log(JSON.stringify(children).replace(/[\[\]\,\"]/g,'').length, JSON.stringify(c).replace(/[\[\]\,\"]/g,'').length)

// 	return c
// }

//to reduce serverless calls to refresh token
// const checkToken = async (loggedIn: boolean, token, skipCheck = false) => {
// 	let accessToken = token?.accessToken
// 	let returnToken = token
// 	if (
// 		loggedIn &&
// 		(!token?.expires || Math.floor(Date.now() / 1000) > token?.expires) &&
// 		!skipCheck
// 	) {
// 		returnToken = await getToken()
// 		accessToken = await returnToken?.accessToken
// 	}
// 	return {
// 		returnToken,
// 		accessToken
// 	}
// }

export const loadFront = async (
	_loggedIn = false,
	_token?,
	sort = 'hot',
	range?: string,
	after?: string,
	count?: number,
	_localSubs?: [string],
	_skipCheck = false
) => {
	try {
		const result = await request
			.get(`${process.env.NEXT_PUBLIC_HOST}/api/farcaster/casts`)
			.query({
				after,
				sort,
				count,
				range
			})
		const casts: IGetCastsResponse['casts'] = result.body.casts

		const builtData = {
			before: casts[0] ? casts[0].timestamp : null,
			after: casts[casts.length - 1] ? casts[casts.length - 1].timestamp : null,
			children: casts.map(c => castToPost(c))
		}
		// console.log(builtData)
		return builtData
	} catch (e) {
		console.log(e)
	}
}

export const loadSubreddits = async (
	_loggedIn,
	_token,
	subreddits: string,
	sort: string,
	range: string,
	after = '',
	count = 0,
	sr_detail = false
) => {
	const _getSRDetail =
		sr_detail ||
		subreddits?.split('+')?.length > 1 ||
		subreddits?.toUpperCase()?.includes('POPULAR') ||
		subreddits?.toUpperCase()?.includes('ALL')

	try {
		const result = await request
			.get(`${process.env.NEXT_PUBLIC_HOST}/api/farcaster/casts`)
			.query({
				parentUrl: subreddits,
				after,
				sort,
				count,
				range
			})
		const casts: IGetCastsResponse['casts'] = result.body.casts

		const builtData = {
			// after: casts[0] ? casts[0].timestamp : null,
			// before: casts[casts.length - 1] ? casts[0].timestamp : null,
			children: casts.map(c => castToPost(c))
		}
		// console.log(builtData)
		return builtData
	} catch (e) {
		console.log('loadSubreddits error', e)
	}
}

export const getRedditSearch = async (
	params,
	after,
	sort = 'hot',
	loggedIn = false,
	subreddit = 'all',
	range?,
	token?,
	include_over_18?,
	searchtype?
) => {
	let p = {
		...params,
		after,
		sort,
		t: range,
		raw_json: 1,
		sr_detail: true
	}
	//console.log("PARAMS?",subreddit,include_over_18,p)

	let oathsearch = 'https://oauth.reddit.com/search'
	let noauthsearch = `${REDDIT}/search.json`
	if (p?.q?.substring(0, 5)?.toUpperCase() === 'FLAIR') {
		p.q = p.q.replaceAll(' ', '%2B').replaceAll('+', '%2B')
	}
	if (include_over_18) {
		p.include_over_18 = '1'
	} else {
		p.include_over_18 = '0'
	}
	if (subreddit !== 'all') {
		oathsearch = `https://oauth.reddit.com/r/${subreddit}/search/.json?q=${
			p.q
		}&sort=${sort}&restrict_sr=on&include_over_18=${
			include_over_18 ? 'on' : '0'
		}&t=${range}&after=${after}`
		noauthsearch = `https://www.reddit.com/r/${subreddit}/search/.json?q=${
			p.q
		}&sort=${sort}&restrict_sr=on&include_over_18=${
			include_over_18 ? 'on' : '0'
		}&t=${range}&after=${after}`
		p = { raw_json: 1 }
	}

	if (searchtype === 'sr') {
		p.type = 'sr'
	} else if (searchtype === 'user') {
		p.type = 'user'
	}
	//console.log(p);
	let accessToken = token?.accessToken
	let returnToken = token
	if (
		loggedIn &&
		(!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
	) {
		returnToken = await getToken()
		accessToken = await returnToken?.accessToken
	}

	if (
		loggedIn &&
		accessToken &&
		ratelimit_remaining > 1 &&
		!searchtype
		// p["include_over_18"] !== "0" //oath api doesn't respect this setting
	) {
		try {
			//dealing with oath not respecting including_over_18 parameter
			let children = []
			let after = ''
			let before = ''
			do {
				logApiRequest('search', true)
				const res1 = await axios.get(oathsearch, {
					headers: {
						authorization: `bearer ${accessToken}`
					},
					params: p
				})
				const res = await res1.data
				//console.log(oathsearch, p);
				ratelimit_remaining = parseInt(res1.headers['x-ratelimit-remaining'])
				after = res?.data?.after
				p.after = after
				before = res?.data?.before
				if (p.include_over_18 === '0') {
					children = [
						...children,
						...res?.data?.children?.filter(c => {
							return c.data.over_18 !== true
						})
					]
				} else {
					children = res?.data?.children
				}
			} while (
				p.include_over_18 === '0' &&
				after &&
				children.length < 25 &&
				ratelimit_remaining > 1
			)

			return {
				after,
				before,
				children,
				token: returnToken
			}
		} catch (_err) {
			//console.log(err);
		}
	} else {
		try {
			logApiRequest('search', false)
			const res = await (
				await axios.get(noauthsearch, {
					params: p
				})
			).data
			//console.log(res);
			return {
				after: res.data.after,
				before: res.data.before,
				children: res.data.children,
				token: returnToken
			}
		} catch (err) {
			console.log(err)
			return null
		}
	}
}
//retiring for  getRedditSearch
export const loadSubFlairPosts = async (
	subreddit,
	flair: string,
	sort = 'new',
	range = '',
	after = ''
) => {
	const f = flair.replaceAll(' ', '%2B').replaceAll('+', '%2B')
	try {
		logApiRequest('search', false)
		const res = await axios.get(
			`https://www.reddit.com/r/${subreddit}/search/.json?q=${f}&sort=${sort}&restrict_sr=on&include_over_18=on&t=${range}&after=${after}`,
			{
				params: {
					raw_json: 1
					// q: f,
					// sort: sort,
					// t: range,
					// restrict_sr: "on",
					// include_over_18: "on",
				}
			}
		)
		const data = await res.data
		return {
			after: data?.data?.after,
			before: data?.data?.before,
			children: data?.data?.children
		}
	} catch (err) {
		console.log(err)
	}
}
export const getUserMultiPosts = async (
	user: string,
	multiname: string,
	sort = 'hot',
	range?: string,
	after?: string
) => {
	try {
		logApiRequest('u/', false)
		const res = await (
			await axios.get(`${REDDIT}/user/${user}/m/${multiname}/${sort}/.json?`, {
				params: {
					raw_json: 1,
					sort,
					t: range,
					after
				}
			})
		).data
		return {
			after: res.data.after,
			before: res.data.before,
			children: res.data.children
		}
	} catch (_err) {
		return null
	}
}
export const loadSubFlairs = async subreddit => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('r/', true)
			const res = await axios.get(
				`https://www.reddit.com/r/${subreddit}/api/link_flair_v2.json`,
				{
					params: {
						raw_json: 1
					}
				}
			)
			return res
		} catch (err) {
			console.log(err)
			return false
		}
	}
}
//oauth request
export const loadSubInfo = async subreddit => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('r/', true)
			const res = await (
				await axios.get(`https://oauth.reddit.com/r/${subreddit}/about`, {
					headers: {
						authorization: `bearer ${token}`
					},
					params: {}
				})
			).data
			return res
		} catch (_err) {
			return false
		}
	}
	return false
}
//search request no auth required
export const loadSubredditInfo = async (query, _loaduser = false) => {
	if (query) {
		try {
			// logApiRequest(loaduser ? 'u/' : 'r/', false)

			// const res = await (
			// 	await axios.get(`${REDDIT}/${loaduser ? 'user' : 'r'}/${query}/about.json`, {
			// 		///search/.json?q=${query}&type=sr&include_over_18=on`, {
			// 		params: {
			// 			raw_json: 1
			// 		}
			// 	})
			// ).data
			//console.log(query, res);
			// for (let i = 0; i < res?.data?.children?.length - 1; i++){
			//   if (res?.data?.children?.[i]?.data?.display_name?.toUpperCase() === query.toUpperCase()) return res?.data?.children?.[i]?.data
			// }

			// const { body } = await request
			// 	.get(`${process.env.NEXT_PUBLIC_HOST}/api/farcaster/topic`)
			// 	.query({
			// 		parentUrl: query
			// 	})

			// console.log(body)

			const { domain, chain, domainLink, highlight } = getDomainInfo(query)

			return {
				kind: 't5',
				data: {
					title: domain,
					display_name: domain,
					link: domainLink,
					description_html: query,
					description: query,
					header_title: query
				}
			}
		} catch (err) {
			console.log(err)
			return undefined
		}
	} else return undefined
}

export const getWikiContent = async wikiquery => {
	try {
		logApiRequest('r/', false)
		const content = await (
			await axios.get(`https://www.reddit.com/r/${wikiquery.join('/')}.json`, {
				params: { raw_json: 1 }
			})
		).data

		return content
	} catch (_err) {
		return undefined
	}
}

export const favoriteSub = async (favorite, name) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch('https://oauth.reddit.com/api/favorite', {
				method: 'POST',
				headers: {
					Authorization: `bearer ${token}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `make_favorite=${favorite}&sr_name=${name}&api_type=json`
			})
			if (res.ok) {
				return true
			}
			return false
		} catch (_err) {
			return false
		}
	}
}

export const subToSub = async (action, name) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			//console.log(dir, id, token);
			let skip_initial_defaults = 1
			const action_source = 'o'
			if (action === 'unsub') skip_initial_defaults = 0
			logApiRequest('cud', true)
			const res = await fetch('https://oauth.reddit.com/api/subscribe', {
				method: 'POST',
				headers: {
					Authorization: `bearer ${token}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `action=${action}&action_source=${action_source}&sr=${name}&skip_initial_defaults=${skip_initial_defaults}`
			})

			if (res.ok) {
				//console.log(res);
				return true
			} else {
				return false
			}
		} catch (_err) {
			//console.log(err);
			return false
		}
	}
}

export const loadUserPosts = async (
	token,
	loggedIn,
	username: string,
	sort,
	range: string,
	after = '',
	count = 0,
	mode?
) => {
	// const { returnToken, accessToken } = await checkToken(loggedIn, token)
	try {
		// const slug = permalink.match(/\/([^/]+)$/)
		// console.log({ slug })
		const result = await request
			.get(`${process.env.NEXT_PUBLIC_HOST}/api/farcaster/casts`)
			.query({
				fname: username,
				after,
				count,
				sort,
				mode
			})
		const casts: IGetCastsResponse['casts'] = result.body.casts

		const builtData = {
			// after: casts[0] ? casts[0].timestamp : null,
			// before: casts[casts.length - 1] ? casts[0].timestamp : null,
			children: casts.map(c => castToPost(c))
		}

		// console.log({ comments: builtData })

		return builtData
		// let res
		// if (loggedIn && accessToken) {
		// 	logApiRequest('u/', true)
		// 	res = await (
		// 		await axios.get(
		// 			`https://oauth.reddit.com/user/${username}/${
		// 				type ? type.toLowerCase() : ''
		// 			}?sort=${sort}`,
		// 			{
		// 				headers: {
		// 					authorization: `bearer ${accessToken}`
		// 				},
		// 				params: {
		// 					raw_json: 1,
		// 					t: range,
		// 					after,
		// 					count,
		// 					sr_detail: true
		// 				}
		// 			}
		// 		)
		// 	).data
		// } else {
		// 	logApiRequest('u/', false)
		// 	res = await (
		// 		await axios.get(
		// 			`${REDDIT}/user/${username}/${
		// 				type ? type.toLowerCase() : ''
		// 			}.json?sort=${sort}`,
		// 			{
		// 				params: {
		// 					raw_json: 1,
		// 					t: range,
		// 					after,
		// 					count,
		// 					sr_detail: true
		// 				}
		// 			}
		// 		)
		// 	).data
		// }
		// return {
		// 	count: count + res?.data?.children?.length ?? 0,
		// 	after: res.data?.after ?? null,
		// 	before: res.data?.before,
		// 	children: res?.data?.children ?? [],
		// 	token: returnToken
		// }
	} catch (_err) {
		//console.log(err);
		return { after: null }
	}
}

export const loadUserSelf = async (
	token,
	loggedIn,
	where,
	sort,
	range,
	after,
	username?,
	type = 'links'
) => {
	let accessToken = token?.accessToken
	let returnToken = token
	if (
		loggedIn &&
		(!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
	) {
		returnToken = await getToken()
		accessToken = await returnToken?.accessToken
	}

	if (loggedIn && accessToken && ratelimit_remaining > 1) {
		try {
			logApiRequest('u/', true)
			const res = await axios.get(
				`https://oauth.reddit.com/user/${username}/${where}`,
				{
					headers: {
						Authorization: `bearer ${accessToken}`
					},
					params: {
						raw_json: 1,
						after,
						username,
						t: range,
						sort,
						show: where,
						type,
						sr_detail: true
					}
				}
			)
			ratelimit_remaining = parseInt(res.headers['x-ratelimit-remaining'])

			const data = await res.data

			return {
				after: data.data.after,
				before: data.data.before,
				children: data.data.children,
				token: returnToken
			}
		} catch (err) {
			console.log(err)
			return undefined
		}
	}
	return undefined
}

export const getSubreddits = async (after?, type = 'popular') => {
	try {
		console.log('getSubreddits', type)
		logApiRequest('r/', false)
		const res = await axios.get(`${REDDIT}/subreddits/${type}.json`, {
			params: { after, raw_json: 1, include_over_18: 1 }
		})
		const data = await res.data
		if (data?.data?.children) {
			return { after: data?.data?.after, children: data?.data?.children }
		}
		return undefined
	} catch (_err) {
		console.log(_err)
	}
	return undefined
}

export const getMySubs = async (after?, count?) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await axios.get(
				'https://oauth.reddit.com/subreddits/mine/subscriber',
				{
					headers: {
						authorization: `bearer ${token}`
					},
					params: {
						after,
						before: '',
						count,
						limit: 100
					}
				}
			)
			const data = await res.data
			ratelimit_remaining = parseInt(res.headers['x-ratelimit-remaining'])
			if (data?.data?.children ?? false) {
				return { after: data.data.after, children: data.data.children }
			}
		} catch (_err) {
			//console.log(err);
		}
	}
	return null
}

export const getAllMyFollows = async () => {
	let alldata = []
	let after = ''
	const count = 0
	const token = await (await getToken())?.accessToken
	let done = false
	while (!done) {
		if (token && ratelimit_remaining > 1) {
			try {
				logApiRequest('cud', true)
				const res = await axios.get(
					'https://oauth.reddit.com/subreddits/mine/subscriber',
					{
						headers: {
							authorization: `bearer ${token}`
						},
						params: {
							after,
							before: '',
							count,
							limit: 100
						}
					}
				)
				const data = await res.data
				ratelimit_remaining = parseInt(res.headers['x-ratelimit-remaining'])
				if (data?.data?.children ?? false) {
					alldata = [...alldata, ...data.data.children]
					if (data?.data?.after ?? false) {
						after = data.data.after
					} else {
						done = true
					}
				} else {
					done = true
				}
			} catch (_err) {
				done = true
				//console.log(err);
			}
		} else {
			done = true
		}
	}
	alldata = alldata.sort((a, b) =>
		a.data.display_name.localeCompare(b.data.display_name)
	)
	//split subs and users
	const users = []
	const subs = []
	for (const a of alldata) {
		if (a?.data?.display_name?.substring(0, 2) === 'u_') {
			const d = await loadSubredditInfo(
				a?.data?.display_name?.substring(2),
				true
			)
			d && users.push(d)
		} else {
			subs.push(a)
		}
	}
	return { users, subs }
}

export const getUserMultiSubs = async (user: string, multi: string) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await axios.get(
				`https://oauth.reddit.com/api/multi/user/${user}/m/${multi}`,
				{
					headers: {
						Authorization: `bearer ${token}`
					}
				}
			)
			ratelimit_remaining = parseInt(res.headers['x-ratelimit-remaining'])
			const data = await res.data
			const subs = []
			data?.data?.subreddits?.forEach(s => {
				subs.push(s?.name)
			})
			//console.log(subs);
			return subs
		} catch (err) {
			console.log('err', err)
		}
	}
}

export const getMyMultis = async () => {
	const token = await (await getToken())?.accessToken
	//console.log(token);
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await axios.get('https://oauth.reddit.com/api/multi/mine', {
				headers: {
					authorization: `bearer ${token}`
				},
				params: {}
			})
			//console.log(res);
			const data = await res.data
			ratelimit_remaining = parseInt(res.headers['x-ratelimit-remaining'])
			return data
		} catch (err) {
			console.log(err)
		}
	} else {
		//console.log(ratelimit_remaining, 'huh');
	}
}

export const addToMulti = async (
	multi: string,
	user: string,
	srname: string
) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch(
				`/api/reddit/multi/user/${user}/m/${multi}/r/${srname}?model=${encodeURIComponent(
					`{"name":"${srname}"}`
				)}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `bearer ${token}`
					}
				}
			)
			//ratelimit_remaining = res.headers["x-ratelimit-remaining"];
			return res
		} catch (err) {
			console.log('err', err)
		}
	}
}
export const deleteFromMulti = async (
	multi: string,
	user: string,
	srname: string
) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch(
				`/api/reddit/multi/user/${user}/m/${multi}/r/${srname}?model=${encodeURIComponent(
					`{"name":"${srname}"}`
				)}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `bearer ${token}`
					}
				}
			)
			//ratelimit_remaining = res.headers["x-ratelimit-remaining"];
			return res
		} catch (err) {
			console.log('err', err)
		}
	}
}
export const createMulti = async (
	display_name: string,
	user: string,
	srnames: string[],
	visibility = 'private',
	_description_md?: string,
	_key_color?: string
) => {
	// {
	//   "description_md": raw markdown text,
	//   "display_name": a string no longer than 50 characters,
	//   "icon_img": one of (`png`, `jpg`, `jpeg`),
	//   "key_color": a 6-digit rgb hex color, e.g. `#AABBCC`,
	//   "subreddits": [
	//     {
	//       "name": subreddit name,
	//     },
	//     ...
	//   ],
	//   "visibility": one of (`private`, `public`, `hidden`),
	// }
	const subreddits = srnames.map(s => {
		return `{"name": "${s}"}`
	})
	const json = `{"description":"","display_name":"${display_name}","icon_img":"https://www.redditstatic.com/custom_feeds/custom_feed_default_4.png", "subreddits": [${subreddits}], "visibility":"${visibility}"}`
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const uri = `/multi/user/${user}/m/${display_name}/?model=${encodeURIComponent(
				json
			)}`
			const res = await fetch(`/api/reddit${uri}`, {
				method: 'PUT',
				headers: {
					Authorization: `bearer ${token}`
				}
			})
			return res
		} catch (err) {
			console.log('err', err)
		}
	}
}
export const deleteMulti = async (multiname, username) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch(
				`https://oauth.reddit.com/api/multi/user/${username}/m/${multiname}/`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `bearer ${token}`
					}
				}
			)
			//ratelimit_remaining = res.headers["x-ratelimit-remaining"];
			//console.log(res);
			return res
		} catch (err) {
			console.log('err', err)
		}
	}
}

export const searchSubreddits = async (
	query,
	over18 = false,
	loggedIn = false,
	token?
) => {
	//const token = await (await getToken())?.accessToken;
	let accessToken = token?.accessToken
	let returnToken = token
	if (
		loggedIn &&
		(!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
	) {
		returnToken = await getToken()
		accessToken = await returnToken?.accessToken
	}
	if (loggedIn && accessToken && ratelimit_remaining > 1) {
		try {
			logApiRequest('search', true)
			const res = await axios.get(
				'https://oauth.reddit.com/api/subreddit_autocomplete_v2',
				{
					headers: {
						authorization: `bearer ${accessToken}`
					},
					params: {
						include_over_18: over18,
						include_profiles: false,
						query,
						typeahead_active: true
					}
				}
			)
			const data = await res.data
			ratelimit_remaining = parseInt(res.headers['x-ratelimit-remaining'])
			//console.log(res);
			return { data: data?.data?.children, token: returnToken }
		} catch (err) {
			console.log(err)
			return []
		}
	} else {
		try {
			logApiRequest('search', false)
			const res = await (
				await axios.get(`${REDDIT}/search/.json?q=${query}&type=sr`, {
					params: {
						raw_json: 1
					}
				})
			).data
			return { data: res?.data?.children?.slice(0, 4), token: returnToken }
		} catch (err) {
			console.log(err)
			return undefined
		}
		return undefined
	}
	return undefined
}

export const loadComments = async (permalink, _sort = 'top') => {
	try {
		// //console.log(permalink);
		// logApiRequest('thread', false)
		// const res = await (
		// 	await axios.get(`${REDDIT}${permalink}.json?sort=${sort}`, {
		// 		params: {
		// 			raw_json: 1
		// 		}
		// 	})
		// ).data
		// //console.log(res?.[1]);
		// return res?.[1]?.data?.children ?? null
		const slug = permalink.match(/\/([^/]+)$/)
		const result = await request
			.get(`${process.env.NEXT_PUBLIC_HOST}/api/farcaster/casts`)
			.query({
				parentHash: slug[2]
			})
		const casts: IGetCastsResponse['casts'] = result.body.casts

		const builtData = {
			// after: casts[0] ? casts[0].timestamp : null,
			// before: casts[casts.length - 1] ? casts[0].timestamp : null,
			children: casts.map(c => castToPost(c))
		}

		// console.log({ comments: builtData })

		return builtData
	} catch (_err) {
		//console.log(err);
	}
}

export const loadMoreComments = async (
	children,
	link_id,
	permalink?,
	loggedIn = false,
	token?,
	sort = 'top',
	_depth?,
	id?
) => {
	const { returnToken, accessToken } = await checkToken(loggedIn, token)
	if (accessToken && ratelimit_remaining > 1) {
		try {
			logApiRequest('thread', true)
			const res = await fetch('https://oauth.reddit.com/api/morechildren', {
				method: 'POST',
				headers: {
					Authorization: `bearer ${accessToken}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `api_type=json&children=${children}&link_id=${link_id}&sort=${sort}&limit_children=${false}&raw_json=1&&id=${id}&profile_img=${true}` //&category=${category}
			})
			const data = await res.json()
			return { data: data?.json?.data?.things, token: returnToken }
		} catch (err) {
			console.log(err)
			return undefined
		}
	} else {
		logApiRequest('thread', false)
		const res = await (
			await axios.get(`${REDDIT}${permalink}.json`, {
				params: { raw_json: 1, profile_img: true }
			})
		).data
		return { data: res?.[1]?.data?.children, token: returnToken }
	}
}

export const loadPost = async (
	permalink: string /*, sort = 'top', loggedIn = false, token?, withcontext?, withDetail = false */
) => {
	try {
		const slug = permalink.match(/\/([^/]+)$/)
		const _query: Record<string, string> = {}

		const [resultCast, resultCommentss] = await Promise.all([
			request.get(`${process.env.NEXT_PUBLIC_HOST}/api/farcaster/casts`).query({
				hash: slug[1]
			}),
			request.get(`${process.env.NEXT_PUBLIC_HOST}/api/farcaster/casts`).query({
				parentHash: slug[1]
			})
		])

		const post: IGetCastsResponse['casts'] = resultCast.body.casts[0]
		const postComments: IGetCastsResponse['casts'] = resultCommentss.body.casts

		const builtData = {
			// after: casts[0] ? casts[0].timestamp : null,
			// before: casts[casts.length - 1] ? casts[0].timestamp : null,
			post: castToPost(post),
			post_comments: postComments.map(c => castToPost(c))
		}

		return builtData
	} catch (e) {
		console.log(e)
	}
	// let accessToken = token?.accessToken
	// let returnToken = token
	// //const token = await (await getToken())?.accessToken;
	// if (loggedIn && (!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)) {
	// 	returnToken = await getToken()
	// 	accessToken = await returnToken?.accessToken
	// }
	// if (loggedIn && accessToken && ratelimit_remaining > 1) {
	// 	let path = permalink
	// 	//handle direct link case
	// 	if (!permalink.includes('/comments/')) {
	// 		try {
	// 			logApiRequest('thread', false)
	// 			const res = await (
	// 				await axios.get(`${REDDIT}${permalink}.json?sort=${sort}`, {
	// 					params: { raw_json: 1, profile_img: true, sr_detail: withDetail }
	// 				})
	// 			).data
	// 			path = res?.[0]?.data?.children?.[0].data?.permalink
	// 		} catch (_err) {}
	// 	}

	// 	try {
	// 		logApiRequest('thread', true)
	// 		const res = await axios.get(`https://oauth.reddit.com${path}`, {
	// 			headers: {
	// 				authorization: `bearer ${accessToken}`
	// 			},
	// 			params: {
	// 				raw_json: 1,
	// 				article: path.split('/')?.[4] ?? path,
	// 				context: withcontext ? 10000 : 1,
	// 				showedits: true,
	// 				showmedia: true,
	// 				showmore: true,
	// 				showtitle: true,
	// 				sort: sort,
	// 				theme: 'default',
	// 				threaded: true,
	// 				truncate: true,
	// 				profile_img: true,
	// 				sr_detail: withDetail
	// 			}
	// 		})
	// 		const data = await res.data
	// 		ratelimit_remaining = parseInt(res.headers['x-ratelimit-remaining'])
	// 		const post = {
	// 			post: data?.[0]?.data?.children?.[0]?.data,
	// 			post_comments: data?.[1]?.data?.children
	// 		}
	// 		return { ...post, token: returnToken }
	// 	} catch (_err) {
	// 		return { post: undefined, post_comments: undefined, token: returnToken }
	// 	}
	// } else {
	// 	try {
	// 		logApiRequest('thread', false)
	// 		const res = await (
	// 			await axios.get(`${REDDIT}${permalink}.json?sort=${sort}`, {
	// 				params: {
	// 					raw_json: 1,
	// 					profile_img: true,
	// 					sr_detail: withDetail,
	// 					context: withcontext ? 10000 : ''
	// 				}
	// 			})
	// 		).data
	// 		const data = {
	// 			post: res?.[0]?.data?.children?.[0].data,
	// 			post_comments: res?.[1]?.data?.children,
	// 			token: returnToken
	// 		}
	// 		//console.log(data);
	// 		return data
	// 	} catch (_err) {
	// 		//console.log(err);
	// 		return { post: undefined, post_comments: undefined, token: returnToken }
	// 	}
	// }
}

export const getMyID = async () => {
	const token = await (await getToken())?.accessToken
	try {
		logApiRequest('cud', true)
		const _res = await axios.get('https://oauth.reddit.com/api/v1/me', {
			headers: {
				authorization: `bearer ${token}`
			}
		})
	} catch (err) {
		console.log(err)
	}
}

export const saveLink = async (_category, id, isSaved) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch(
				`https://oauth.reddit.com/api/${isSaved ? 'unsave' : 'save'}`,
				{
					method: 'POST',
					headers: {
						Authorization: `bearer ${token}`,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: `id=${id}` //&category=${category}
				}
			)
			if (res?.ok) {
				return { saved: isSaved ? false : true, id }
			} else {
				throw new Error('Unable to save')
			}
		} catch (err) {
			console.log(err)
			throw new Error('Unable to save')
		}
	}
	throw new Error('Unable to save')
}

export const hideLink = async (id, isHidden) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch(
				`https://oauth.reddit.com/api/${isHidden ? 'unhide' : 'hide'}`,
				{
					method: 'POST',
					headers: {
						Authorization: `bearer ${token}`,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: `id=${id}` //&category=${category}
				}
			)
			if (res?.ok) {
				return { hidden: isHidden ? false : true, id }
			} else {
				throw new Error('Unable to hide')
			}
		} catch (_err) {
			throw new Error('Unable to hide')
			return false
		}
	}
	throw new Error('Unable to hide')
}

export const postVote = async (dir: number, id) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		logApiRequest('cud', true)
		const res = await fetch('https://oauth.reddit.com/api/vote', {
			method: 'POST',
			headers: {
				Authorization: `bearer ${token}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: `id=${id}&dir=${dir}&rank=3`
		})
		if (res.ok) {
			return { vote: dir, id }
		}
		// } catch (err) {
		//   return err;
		// }
	}
	throw new Error('Unable to vote')
}

export const postComment = async (parent, text) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch('https://oauth.reddit.com/api/comment', {
				method: 'POST',
				headers: {
					Authorization: `bearer ${token}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `api_type=${'json'}&return_rtjson=${true}&text=${encodeURIComponent(
					text
				)}&thing_id=${parent}`
			})
			const data = await res.json()
			if (res.ok) {
				if (data?.json?.errors) {
					throw new Error('Comment error')
				}
				return data
			} else {
				throw new Error('Unable to comment')
			}
		} catch (_err) {
			throw new Error('Unable to comment')
		}
	}
	throw new Error('Unable to comment')
}

export const editUserText = async (id: string, text: string) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch('https://oauth.reddit.com/api/editusertext', {
				method: 'POST',
				headers: {
					Authorization: `bearer ${token}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `api_type=${'json'}&return_rtjson=${true}&text=${encodeURIComponent(
					text
				)}&thing_id=${id}`
			})
			const data = await res.json()
			if (res.ok) {
				if (data?.json?.errors) {
					throw new Error('Edit text error')
				}
				return data
			} else {
				throw new Error('Unable to edit text')
			}
		} catch (_err) {
			throw new Error('Unable to edit text')
		}
	}
	throw new Error('Unable to edit text')
}

export const deleteLink = async (id: string) => {
	const token = await (await getToken())?.accessToken
	if (token && ratelimit_remaining > 1) {
		try {
			logApiRequest('cud', true)
			const res = await fetch('https://oauth.reddit.com/api/del', {
				method: 'POST',
				headers: {
					Authorization: `bearer ${token}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `id=${id}`
			})
			const data = await res.json()
			if (res.ok) {
				return data
			} else {
				throw new Error('Unable to delete')
			}
		} catch (_err) {
			throw new Error('Unable to delete')
		}
	}
	throw new Error('Unable to delete')
}

export const findDuplicates = async (
	token,
	loggedIn,
	permalink: string,
	after = '',
	count = 0
) => {
	const { returnToken, accessToken } = await checkToken(loggedIn, token)
	if (loggedIn && accessToken) {
		try {
			logApiRequest('thread', false)
			const res = await (
				await axios.get(
					`https://oauth.reddit.com${permalink?.replace(
						'/comments/',
						'/duplicates/'
					)}`,

					{
						headers: {
							authorization: `bearer ${accessToken}`
						},
						params: {
							raw_json: 1,
							after,
							count
						}
					}
				)
			).data
			//console.log("Dup:", res);
			return { res, returnToken }
		} catch (err) {
			console.log('err', err)
		}
	} else {
		try {
			logApiRequest('thread', false)
			const res = await (
				await axios.get(
					`https://www.reddit.com${permalink?.replace(
						'/comments/',
						'/duplicates/'
					)}.json`,
					{
						params: {
							raw_json: 1,
							after,
							count
						}
					}
				)
			).data
			//console.log("duplo",res);
			return { res }
		} catch (err) {
			console.log('err', err)
		}
	}
}
