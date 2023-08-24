/* eslint-disable @next/next/no-img-element */

import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import { AiOutlineGithub } from 'react-icons/ai'
import packageInfo from '../../package.json'
const VERSION = packageInfo.version
const link = 'hover:underline text-white '

const AboutPage = ({ changelog }) => {
	return (
		<div className="h-screen mx-4 -mt-16">
			<Head>
				<title>About | ReddiCast</title>
			</Head>
			<div className="h-full text-justify text-th-text ">
				<div className="flex flex-col justify-center max-w-xl min-h-full gap-4 mx-auto space-y-1 overflow-y-scroll scrollbar-none ">
					<p className="">
						ReddiCast is an experimental web app for{' '}
						<a
							href="https://www.farcaster.xyz/"
							target="__blank"
							className={link}
						>
							Farcaster
						</a>{' '}
						based on{' '}
						<a
							href="https://github.com/burhan-syed/troddit"
							target="__blank"
							className={link}
						>
							Troddit
						</a>
						, an open source Reddit client.
					</p>

					<p className="">
						It was created by{' '}
						<a href="/u/kencodes" target="__blank" className={link}>
							Ken Goldfarb
						</a>{' '}
						as an experiment on top of{' '}
						<a
							href="https://github.com/farcasterxyz/protocol/discussions/71"
							target="__blank"
							className={link}
						>
							FIP-2
						</a>
						.
					</p>

					<p className="">
						<Link
							href={'/changelog'}
							className="flex flex-wrap justify-between pt-5 font-semibold hover:underline"
						>
							<h4>v{VERSION}</h4>
							<h4>See Changelog</h4>
						</Link>
					</p>
				</div>
				<div className="absolute left-0 w-full bottom-5 sm:bottom-20">
					<div className="flex items-center justify-between max-w-xl mx-4 sm:mx-auto">
						<a
							href="https://github.com/kengoldfarg/reddicast"
							target="_blank"
							rel="noreferrer"
							className="hover:cursor-pointer"
						>
							<AiOutlineGithub className="w-12 h-12 transition-all hover:scale-110" />
						</a>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AboutPage
