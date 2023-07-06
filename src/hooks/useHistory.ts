import React, { useState } from 'react'
import { localRead, localSeen, useMainContext } from '../MainContext'

const useHistory = () => {
	const context: any = useMainContext()
	const clearRead = async (_since?: number) => {
		return await context.clearReadPosts()
	}
	const clearSeen = async (_since?: number) => {
		try {
			await localSeen.clear()
			return true
		} catch (_err) {
			return false
		}
	}
	const getReadCount = async () => {
		return localRead.length()
	}
	const getSeenCount = async () => {
		return localSeen.length()
	}
	return {
		clearRead,
		clearSeen,
		getSeenCount,
		getReadCount
	}
}

export default useHistory
