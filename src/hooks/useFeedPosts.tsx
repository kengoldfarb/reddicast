import ToastCustom from '../components/toast/ToastCustom'
import useFeedGallery from './useFeedGallery'
import { UseInfiniteQueryResult } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
const useFeedPosts = ({
	feed,
	askToUpdateFeed = true,
	setKey
}: {
	feed: UseInfiniteQueryResult<
		{
			filtered: any
			after: any
			count: any
			prevPosts: any
		},
		unknown
	>
	askToUpdateFeed?: boolean
	setKey(k: string): void
}) => {
	const { setFeedData } = useFeedGallery()

	const [flatPosts, setFlatPosts] = useState<any[]>([])
	const [newPosts, setNewPosts] = useState<any[]>([])
	const [newPostsCount, setNewPostsCount] = useState(0)
	const [blocked, setBlocked] = useState(false)
	const [checked, setChecked] = useState(false)
	// useEffect(() => {
	//   if (blocked) {
	//     setFlatPosts([]);
	//   } else {
	//     setFlatPosts(feed.data?.pages?.map((page) => page.filtered).flat() ?? []);
	//   }
	// }, [feed?.data?.pages, blocked]);

	useEffect(() => {
		if (!blocked) {
			toast.remove('blocked')
		}
	}, [blocked])
	useEffect(() => {
		const domain = window?.location?.hostname

		const updatePostsInPlace = (newPosts, appendNewPosts = false) => {
			if (blocked) {
				return
			}
			setFlatPosts((pposts) => {
				let newPostCount = 0
				const pPostMap = new Map()
				const newPostArr = [] as any[]
				pposts.forEach((p) => pPostMap.set(p?.data?.name, p))
				newPosts.forEach((np) => {
					const prevPost = pPostMap.get(np?.data?.name)
					if (prevPost?.data?.name) {
						pPostMap.set(prevPost?.data?.name, np)
					} else {
						newPostCount += 1
						newPostArr.push(np)
					}
				})
				if (appendNewPosts) {
					return [...Array.from(pPostMap.values()), ...newPostArr]
				}
				setNewPostsCount(newPostCount)
				setNewPosts(() => (newPostCount > 0 ? [...newPostArr, ...Array.from(pPostMap.values())] : []))
				return Array.from(pPostMap.values())
			})
		}

		const check = (d) => {
			setChecked(true)
			let isBlocked = false
			let c = 0
			const p = process.env.NEXT_PUBLIC_CHECK
			const _r = process.env.NEXT_PUBLIC_R as string
			const l = JSON.parse(process.env.NEXT_PUBLIC_OKLIST ?? '[]')?.map((s: string) => s.toUpperCase()) as string[]
			d.forEach((i) => {
				if (i?.data?.[`${p}`] === true && !l.includes(i?.data?.subreddit?.toUpperCase())) {
					c++
				}
			})
			if (c / d.length > 0.9) {
				isBlocked = true
				setBlocked(true)
				const _t = toast.custom(
					(t) => <ToastCustom t={t} message={`${process.env.NEXT_PUBLIC_M}`} mode={'alert'} showAll={true} />,
					{ position: 'bottom-center', duration: Infinity, id: 'blocked' }
				)
			}
			return isBlocked
		}
		const posts = feed?.data?.pages?.flatMap((page) => page.filtered) as any[]
		if (posts?.length > 0) {
			let isBlocked = false
			if (!checked && !blocked && domain === 'reddica.st') {
				isBlocked = check(posts)
			}
			if (!isBlocked && !blocked) {
				if (posts?.length > flatPosts?.length) {
					//console.log('new posts')
					updatePostsInPlace(posts, true)
				} else {
					//console.log('update in place posts')
					updatePostsInPlace(posts)
				}
			}
		} else if (feed.hasNextPage && !blocked) {
			//console.log("nodata.. fetching more");
			feed.fetchNextPage()
		}
	}, [feed?.data?.pages])

	const overwritePosts = (setKey) => {
		setKey?.((k) => `${k}_${Math.random()}`)
		setNewPostsCount(0)
		setFlatPosts(newPosts)
	}
	useEffect(() => {
		if (newPostsCount > 0) {
			toast.remove('new_post')
			if (!askToUpdateFeed) {
				overwritePosts(setKey)
			} else {
				const _tId = toast.custom(
					(t) => (
						<ToastCustom
							t={t}
							message={`${newPostsCount} new post${newPostsCount === 1 ? '' : 's'}`}
							mode={'new_posts'}
							action={() => {
								overwritePosts(setKey)
								if (window) {
									window.scrollTo({ top: 0, behavior: 'smooth' })
								}
							}}
							actionLabel={'Update feed?'}
						/>
					),
					{ position: 'bottom-right', duration: 1000 * 60 * 60, id: 'new_post' }
				)
			}
		}
		;() => {
			toast.remove('new_post')
		}
	}, [newPostsCount, askToUpdateFeed])

	useEffect(() => {
		if (flatPosts) {
			setFeedData(flatPosts)
		}
	}, [flatPosts])

	return { flatPosts }
}

export default useFeedPosts
