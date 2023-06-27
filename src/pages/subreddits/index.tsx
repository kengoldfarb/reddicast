import NavBar from '../../components/NavBar'
import SubredditsPage from '../../components/SubredditsPage'
import { MyCollectionsProvider } from '../../components/collections/CollectionContext'
import Head from 'next/head'
import React from 'react'

const Subreddits = () => {
	return (
		<div>
			<Head>
				<title>{'troddit · subreddits'}</title>
			</Head>

			<main>
				<SubredditsPage />
			</main>
		</div>
	)
}

export default Subreddits
