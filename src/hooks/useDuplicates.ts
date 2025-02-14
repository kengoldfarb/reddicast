import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { findMediaInfo } from '../../lib/utils'
import { useMainContext } from '../MainContext'
import { findDuplicates } from '../RedditAPI'

const useDuplicates = ({ enabled, permalink }) => {
	const { data: session, status } = useSession()
	const context: any = useMainContext()
	const _loading = status === 'loading'
	// const [totalDuplicates, setTotalDuplicates] = useState(0);
	const fetchDuplicates = async fetchParams => {
		const feedParams = {
			loggedIn: status === 'authenticated' ? true : false,
			after: fetchParams.pageParam?.after ?? '',
			count: fetchParams.pageParam?.count ?? 0
		}
		const res = await findDuplicates(
			context.token,
			feedParams.loggedIn,
			permalink,
			feedParams.after,
			feedParams.count
		)
		const data = res?.res?.[1]?.data
		const totalDuplicates =
			res?.res?.[0]?.data?.children?.[0]?.data?.num_duplicates
		// console.log("DATA?", data);
		const postsWithMedia = new Array(data?.children?.length)
		await Promise.all(
			data?.children?.map(async (c, i) => {
				//const mInfo = await findMediaInfo(c.data);
				postsWithMedia[i] = {
					...c,
					data: {
						...c.data,
						//mediaInfo: mInfo,
						num_duplicates: totalDuplicates
					}
				}
			})
		)
		return {
			posts: postsWithMedia,
			after: data?.after,
			count: data?.children?.length
		}
	}
	const duplicateQuery = useInfiniteQuery(
		['duplicates', permalink],
		fetchDuplicates,
		{
			enabled: !!enabled && !!permalink,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			staleTime: Infinity,
			// cacheTime: Infinity,
			getNextPageParam: lastPage => {
				//console.log('lastPage?ß', lastPage)
				if (lastPage.after || lastPage.after === '') {
					return {
						after: lastPage?.after ?? '',
						count: lastPage?.count ?? 0
					}
				}
				return undefined
			}
			// setting initial data directly in fetchFeed() instead
			// initialData: () => {
			//   return formatInitialData();
			// },
		}
	)
	const flatPosts = duplicateQuery.data?.pages?.flatMap(p => p?.posts)
	return {
		flatPosts,
		duplicateQuery,
		totalDuplicates: flatPosts?.[0]?.data?.num_duplicates
	}
}

export default useDuplicates
