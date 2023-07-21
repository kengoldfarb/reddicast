import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { useUser } from '../hooks/useUser'

export default function LoginProfile() {
	const { user } = useUser()
	const router = useRouter()

	if (!user)
		return (
			<button
				aria-label="login"
				className="w-full h-full"
				onClick={() => {
					router.push('/login')
				}}
			>
				Login
			</button>
		)

	if (user)
		return (
			<Link legacyBehavior href={`/u/${user.fname}`}>
				<button
					aria-label="profile"
					className="w-full h-full text-center capitalize"
				>
					Profile
				</button>
			</Link>
		)
	return <div className="w-full h-full" />
}
