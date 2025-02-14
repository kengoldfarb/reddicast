// import { getWikiContent, loadPost } from '../../RedditAPI'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { findMediaInfo } from '../../../lib/utils'
import Collection from '../../components/collections/Collection'
import Feed from '../../components/Feed'
import LoginModal from '../../components/LoginModal'
import NavBar from '../../components/NavBar'
import ParseBodyHTML from '../../components/ParseBodyHTML'
import PostModal from '../../components/PostModal'
import SubredditBanner from '../../components/SubredditBanner'
import {
	loadSubredditInfo,
	loadSubreddits,
	getWikiContent,
	loadPost,
	getDomainInfo
} from '../../FarcasterAPI'
import useThread from '../../hooks/useThread'
const SubredditPage = ({ query, metaTags, post, postData }) => {
	const [subsArray, setSubsArray] = useState<string[]>([])
	const [wikiContent, setWikiContent] = useState('')
	const [wikiMode, setWikiMode] = useState(false)
	const [commentThread, setCommentThread] = useState(false)
	const [postThread, setPostThread] = useState(false)
	const [withCommentContext, setWithCommentContext] = useState(false)

	useEffect(() => {
		const getWiki = async wikiquery => {
			const data = await getWikiContent(wikiquery)
			setWikiContent(data?.data?.content_html ?? 'nothing found')
		}

		setSubsArray(
			query?.slug?.[0]
				.split(' ')
				.join('+')
				.split(',')
				.join('+')
				.split('%20')
				.join('+')
				.split('+')
		)
		if (query?.slug?.[1]?.toUpperCase() === 'COMMENTS') {
			setPostThread(true)
			query?.context && setWithCommentContext(true)
			query?.slug?.[4] && setCommentThread(true)
		} else if (query?.slug?.[1]?.toUpperCase() === 'WIKI') {
			setWikiMode(true)
			const wikiquery = query.slug
			if (!wikiquery?.[2]) wikiquery[2] = 'index'
			getWiki(wikiquery)
		}
		return () => {
			setPostThread(false)
			setWithCommentContext(false)
			setCommentThread(false)
			setWikiMode(false)
			setSubsArray([])
		}
	}, [query])

	const { domain } = getDomainInfo(query.slug[0])

	return (
		<div
			className={`${
				subsArray?.[0]?.toUpperCase() !== 'ALL' &&
				subsArray?.[0]?.toUpperCase() !== 'POPULAR'
					? ' -mt-2 '
					: ''
			} overflow-x-hidden overflow-y-auto `}
		>
			<Head>
				<title>{`${domain} | ReddiCast`}</title>
				{metaTags?.ogDescription && (
					<meta name="description" content={metaTags.ogDescription} />
				)}
				{metaTags?.ogSiteName && (
					<>
						<meta property="og:site_name" content={metaTags?.ogSiteName} />
						{metaTags?.ogDescription && (
							<meta
								property="og:description"
								content={metaTags?.ogDescription}
							/>
						)}
						{metaTags?.ogTitle && (
							<meta property="og:title" content={metaTags?.ogTitle} />
						)}
						{metaTags?.ogImage && (
							<meta property="og:image" content={metaTags?.ogImage} />
						)}
						{metaTags?.ogHeight && (
							<meta property="og:image:height" content={metaTags?.ogHeight} />
						)}
						{metaTags?.ogWidth && (
							<meta property="og:image:width" content={metaTags?.ogWidth} />
						)}
						{metaTags?.ogType && (
							<meta property="og:type" content={metaTags?.ogType} />
						)}
					</>
				)}
			</Head>
			<main>
				{subsArray?.[0]?.toUpperCase() !== 'ALL' &&
				subsArray?.[0]?.toUpperCase() !== 'POPULAR' &&
				subsArray?.length > 0 ? (
					<div className="w-screen ">
						<SubredditBanner subreddits={[subsArray]} userMode={false} />
					</div>
				) : (
					<div className="" />
				)}
				{wikiMode ? (
					<div className="flex flex-col flex-wrap mb-10 md:mx-10 lg:mx-20">
						<Link href={`/r/${subsArray[0]}/wiki`}>
							<h1 className="text-lg font-bold">Wiki</h1>
						</Link>
						{wikiContent ? (
							<ParseBodyHTML html={wikiContent} newTabLinks={false} />
						) : (
							<div className="w-full rounded-md h-96 bg-th-highlight animate-pulse" />
						)}
					</div>
				) : postThread ? (
					<div className="mt-10">
						<LoginModal />
						<PostModal
							permalink={`/r/${query?.slug.join('/')}`}
							returnRoute={query?.slug?.[0] ? `/r/${query?.slug[0]}` : '/'}
							setSelect={setCommentThread}
							direct={true}
							commentMode={commentThread}
							withcontext={withCommentContext}
							postData={post}
							postNum={0}
							curKey={undefined}
						/>
					</div>
				) : (
					<Feed initialData={postData} />
				)}
			</main>
		</div>
	)
}

SubredditPage.getInitialProps = async d => {
	const { query, req, res } = d
	let subreddits = query?.slug?.[0]
	subreddits = query?.slug?.[0]?.split(' ')?.join('+')?.split('%2b')?.join('+')
	// console.log('GET INITIAL PROPS', subreddits)
	if (
		query?.slug?.length < 3 &&
		req &&
		!res?.req?.rawHeaders?.includes(
			`https://${res?.req?.rawHeaders?.[1]}/r/${subreddits}`
		)
	) {
		const session = await getSession({ req })
		let tokenData
		if (session?.user?.name) {
			const token: any = await getToken({
				req,
				secret: process.env.NEXTAUTH_SECRET
			})
			tokenData = {
				accessToken: token.reddit.accessToken,
				refreshToken: token.reddit.refreshToken,
				expires: token.expires
			}
		}
		let posts
		const { domain, chain, domainLink, highlight } = getDomainInfo(
			query.slug?.[0]
		)

		const loadPosts = async () => {
			const data = await loadSubreddits(
				session?.user?.name ? true : false,
				tokenData,
				subreddits,
				query?.slug?.[1] ?? 'hot',
				query?.t ?? 'all',
				'',
				0,
				true
			)
			posts = data?.children
		}
		// const loadSub = async () => {
		// 	const data = await loadSubredditInfo(subreddits?.split('+')?.[0])
		// 	subInfo = data
		// }
		await Promise.all([loadPosts()])
		const metaTags = {
			ogSiteName: 'ReddiCast',
			ogDescription: `r/${domainLink}`,
			// ogImage: '',
			ogTitle: `${domain ?? subreddits} | ReddiCast`
			// ogHeight: '',
			// ogWidth: '',
		}
		if (!session?.user?.name) {
			res.setHeader(
				'Cache-Control',
				'max-age=0, s-maxage=1200, stale-while-revalidate=30'
			)
		}

		return {
			query,
			postData: { children: posts?.slice(0, 6) },
			metaTags
		}
	} else if (req) {
		let url = req?.url
		url = url?.split('?')?.[0]
		if (url?.includes('/comments/')) {
			try {
				const { post } = await loadPost(url)
				//const data = await fetch(`https://www.reddit.com${url}.json`)
				//let post = (await data.json())?.[0]?.data?.children?.[0]?.data;
				const media = await findMediaInfo(
					post,
					true,
					d?.req?.headers?.host?.includes(':')
						? d?.req?.headers?.host?.split(':')?.[0]
						: d?.req?.headers?.host
				)
				const metaTags = {
					ogSiteName: 'ReddiCast',
					ogDescription: `Post on r/${post.subreddit} by u/${
						post.author
					} • ${post.score?.toLocaleString(
						'en-US'
					)} points and ${post.num_comments?.toLocaleString('en-US')} comments`,
					ogTitle: post.title,
					ogImage: media?.imageInfo?.[media?.imageInfo?.length - 1]?.src,
					ogHeight: media?.dimensions?.[1],
					ogWidth: media?.dimensions?.[0],
					ogType: 'image'
				}
				res.setHeader(
					'Cache-Control',
					'max-age=0, s-maxage=3600, stale-while-revalidate=30'
				)
				return { query, metaTags, post: post?.preview ? post : undefined }
			} catch (_err) {
				return { query }
			}
		}
	}

	return { query }
}

export default SubredditPage
