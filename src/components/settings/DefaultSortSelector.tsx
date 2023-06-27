import { useMainContext } from '../../MainContext'
import { COMMENT_SORTS } from '../CommentSort'
import SimpleDropDownSelector from '../ui/SimpleDropDownSelector'
import React, { useEffect, useState } from 'react'

const DefaultSortSelector = ({ mode }: { mode: 'comments' | 'posts' }) => {
	const context: any = useMainContext()

	let SORTS
	let sort
	let setSort

	if (mode === 'posts') {
		throw Error('Not implemented')
		/* TODO: Implement default post sort order
    SORTS = POST_SORTS;
    sort = context.defaultSortPosts;
    setSort = context.setDefaultSortPosts.bind(context);
    */
	} else {
		SORTS = COMMENT_SORTS
		sort = context.defaultSortComments
		setSort = context.setDefaultSortComments.bind(context)
	}

	const sortFriendlyName = SORTS[sort]

	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	return (
		<>
			<SimpleDropDownSelector
				buttonName={mode === 'comments' ? 'Default Comment Sorting' : 'Default Post Sorting'}
				items={SORTS}
				selected={mounted ? sortFriendlyName : ''}
				onSelect={setSort}
			/>
		</>
	)
}

export default DefaultSortSelector
