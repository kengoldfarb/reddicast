import '../../styles/globals.css'
import { MainProvider, localSeen } from '../MainContext'
import { MySubsProvider } from '../MySubs'
import { MyCollectionsProvider } from '../components/collections/CollectionContext'
import log, { LogLevel } from '@kengoldfarb/log'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import Head from 'next/head'
import Script from 'next/script'

import { checkVersion } from '../../lib/utils'
import packageInfo from '../../package.json'
import NavBar from '../components/NavBar'
import ToastCustom from '../components/toast/ToastCustom'
import { usePlausible } from 'next-plausible'
import React, { useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const VERSION = packageInfo.version
const queryClient = new QueryClient()
function MyApp({ Component, pageProps }) {
	const _plausible = usePlausible()
	useEffect(() => {
		const curVersion = VERSION
		const prevVersion = localStorage.getItem('trodditVersion')
		if (prevVersion) {
			const compare = checkVersion(curVersion, prevVersion)
			if (compare === 1) {
				const _toastId = toast.custom(
					(t) => <ToastCustom t={t} message={'Troddit updated! Click to see changelog'} mode={'version'} />,
					{ position: 'bottom-center', duration: 8000 }
				)
			}
		}
		localStorage.setItem('trodditVersion', curVersion)
	}, [])
	useEffect(() => {
		log.setOptions({
			level: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) ?? LogLevel.Warn
		})
	}, [])
	return (
		<>
			<Script defer data-domain={'troddit.com'} src='/js/script.js' />

			<Head>
				<meta
					name='viewport'
					content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover' //user-scalable="no"
				/>
				<link rel='shortcut icon' href='/favicon.ico' />
			</Head>
			<SessionProvider session={pageProps.session}>
				<ThemeProvider defaultTheme='system'>
					<MainProvider>
						<MySubsProvider>
							<MyCollectionsProvider>
								<QueryClientProvider client={queryClient}>
									<NavBar />
									<Component {...pageProps} />
									<Toaster position='bottom-center' />
									<Analytics />
									<ReactQueryDevtools initialIsOpen={false} />
								</QueryClientProvider>
							</MyCollectionsProvider>
						</MySubsProvider>
					</MainProvider>
				</ThemeProvider>
			</SessionProvider>
		</>
	)
}

export default MyApp
