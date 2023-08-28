import Head from 'next/head'
import router, { useRouter } from 'next/router'
import { getSession, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import Feed from '../../components/Feed'
import NavBar from '../../components/NavBar'
import SubredditBanner from '../../components/SubredditBanner'
import { getUserMultiSubs } from '../../FarcasterAPI'
import { useUser } from '../../hooks/useUser'
const Sort = ({ query }) => {
	const router = useRouter()
	// const { data: session, status } = useSession()
	const { user } = useUser()
	const loading = !user
	const [loaded, setLoaded] = useState(false)
	const [_isUser, setIsUser] = useState(false)
	const [forbidden, setForbidden] = useState(false)
	const [mode, setMode] = useState('')
	const [_subsArray, _setSubsArray] = useState([])
	const [username, setUserName] = useState('')
	const [isMulti, setIsMulti] = useState(false)
	const [_feedQuery, setFeedQuery] = useState('')

	const getSubsArray = async () => {
		const subs = await getUserMultiSubs(query?.slug?.[0], query?.slug?.[2])
		// subs?.length > 0 ? setSubsArray(subs) : setSubsArray([]);

		subs && subs?.length > 0 && router.push(`/r/${subs.join('+')}`)
		//?m=${query.slug[2]}
		setLoaded(true)
	}

	//to handle direct routes (ie from going back)
	useEffect(() => {
		if (query.slug?.[1] === 'r' && query.slug?.[3] === 'comments') {
			router.replace(`/${query.slug?.slice(1)?.join('/')}`)
		}
		//multi case
		else if (query.slug?.[3] === 'r' && query.slug?.[5] === 'comments') {
			router.replace(`/${query.slug?.slice(3)?.join('/')}`)
		}
	}, [])

	useEffect(() => {
		const sessionLoad = async (user, mode) => {
			console.log('sessionLoad', { user, mode })
			if (
				(!user || user?.name?.toUpperCase() !== user.toUpperCase()) &&
				(mode === 'SAVED' ||
					mode === 'UPVOTED' ||
					mode === 'DOWNVOTED' ||
					mode === 'HIDDEN')
			) {
				router.push(`/u/${user}`)
				setForbidden(true)
				return false
			} else {
				setForbidden(false)
				setUserName(query?.slug?.[0])
				setFeedQuery(query)
				setIsUser(true)
				setLoaded(true)
				setMode(mode.toUpperCase())
			}
		}

		if (
			query?.slug?.[1]?.toUpperCase() === 'UPVOTED' ||
			query?.slug?.[1]?.toUpperCase() === 'SAVED' ||
			query?.slug?.[1]?.toUpperCase() === 'DOWNVOTED' ||
			query?.slug?.[1]?.toUpperCase() === 'OVERVIEW' ||
			query?.slug?.[1]?.toUpperCase() === 'SUBMITTED' ||
			query?.slug?.[1]?.toUpperCase() === 'COMMENTS' ||
			query?.slug?.[1]?.toUpperCase() === 'HIDDEN'
		) {
			sessionLoad(query?.slug?.[0], query?.slug?.[1]?.toUpperCase())
		} else {
			setIsUser(true)
			setFeedQuery(query)
			if (query?.slug?.[1] === 'm' && query?.slug?.[2]?.length > 0) {
				setIsMulti(true)
				setLoaded(true)
			} else {
				setUserName(query?.slug?.[0])
				setLoaded(true)
			}
		}

		return () => {
			setLoaded(false)
			setIsUser(false)
			setIsMulti(false)
			setForbidden(false)
			setUserName('')
			setMode('')
			setFeedQuery('')
		}
	}, [query, user, loading])

	return (
		<div className="-mt-2 overflow-x-hidden overflow-y-auto">
			<Head>
				<title>
					{query?.slug?.[0] ? `ReddiCast · ${query?.slug?.[0]}` : 'ReddiCast'}
				</title>
			</Head>
			<main className="">
				{forbidden ? (
					<div className="flex items-center justify-center w-screen h-screen">
						Access Forbidden
					</div>
				) : (
					loaded && (
						<div className="">
							<div className="w-screen">
								<SubredditBanner
									subreddits={[`u_${query?.slug?.[0]}`]}
									userMode={true}
									userPostMode={mode}
									name={username}
									isSelf={
										username?.toUpperCase() === user?.displayName?.toUpperCase()
									}
								/>
								{isMulti && (
									<div className="flex justify-center w-full ">{`Viewing multi "${query?.slug?.[2]}" by u/${query?.slug?.[0]}`}</div>
								)}
								{isMulti && !user && (
									<div className="flex justify-center w-full pb-2">
										{'Login to save this multi'}
									</div>
								)}
								{isMulti && user && (
									<div
										className="flex justify-center w-full pb-2 hover:cursor-pointer hover:font-semibold"
										onClick={getSubsArray}
									>
										Click to Extract Subreddits
									</div>
								)}
							</div>
							)
							<Feed />
						</div>
					)
				)}
			</main>
		</div>
	)
}

//can't use getServerSideProps because in app navigation causes page jump
Sort.getInitialProps = ({ query, req }) => {
	return { query }
}

export default Sort
