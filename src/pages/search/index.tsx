import Head from 'next/head'
import React, { useEffect } from 'react'
import Feed from '../../components/Feed'
import NavBar from '../../components/NavBar'
import SearchPage from '../../components/SearchPage'

const Search = ({ query }) => {
	return (
		<div>
			<Head>
				<title>{`${query?.q ? `${query.q} | ReddiCast` : 'ReddiCast'}`}</title>
			</Head>

			<main>
				<SearchPage query={query} />
			</main>
		</div>
	)
}
Search.getInitialProps = ({ query }) => {
	return { query }
}

export default Search
