import React, { useEffect } from 'react'

function spliceSlice(str, index, count, add) {
	// We cannot pass negative indexes directly to the 2nd slicing operation.
	if (index < 0) {
		index = str.length + index
		if (index < 0) {
			index = 0
		}
	}

	return str.slice(0, index) + (add || '') + str.slice(index + count)
}

const PostTitle = ({ post, read = false, newPost = false }) => {
	const [title, setTitle] = React.useState(post?.title ?? '')

	useEffect(() => {
		// Parse the post for mentions
		if (post?.mentions && post.mentions.length > 0) {
			post.mentionsPositions.forEach((mention, i) => {
				const user = post.mentionedUsers[i]
				setTitle(
					spliceSlice(
						post.title,
						mention,
						0,
						`@${user?.fname ?? post.mentions[i]}`
					)
				)
			})
		}
	}, [post])

	return (
		<h2>
			<span
				className={` hover:underline ${
					post?.distinguished === 'moderator' || post?.stickied
						? ' text-th-green '
						: ' '
				}${read ? ' opacity-50 ' : ''}${newPost ? ' mr-2' : ''}`}
				style={{
					wordBreak: 'break-word'
				}}
			>{`${title ?? ''}`}</span>
			{newPost && (
				<span className="text-xs italic font-light text-th-textLight">
					{'(new)'}
				</span>
			)}
		</h2>
	)
}

export default PostTitle
