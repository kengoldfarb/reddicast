/* eslint-disable @next/next/no-img-element */

import packageInfo from '../../package.json'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { AiOutlineGithub } from 'react-icons/ai'
const _VERSION = packageInfo.version
const _link = 'text-th-link hover:underline hover:text-th-linkHover '
import { useCheckSigner, useToken } from '@farsign/hooks'
let QRCode
if (typeof window !== 'undefined') {
	QRCode = require('qrcodejs2')
}

const CLIENT_NAME = 'Feddit'

const LoginPage: React.FC = () => {
	const [token, _setToken] = useToken(CLIENT_NAME)
	const [isConnected] = useCheckSigner(CLIENT_NAME)
	const [qrcode, setQRCode] = useState<undefined | any>()

	console.log({ token, QRCode, isConnected })

	useEffect(() => {
		if (qrcode) {
			qrcode.clear()
			qrcode.makeCode(token.deepLink)
		} else {
			const q = new QRCode(document.getElementById('qr-login'), {
				text: token.deepLink,
				width: 400,
				height: 400,
				colorDark: '#000000',
				colorLight: '#ffffff',
				correctLevel: QRCode.CorrectLevel.H
			})
			setQRCode(q)
		}
	}, [token, qrcode])

	// useEffect(() => {
	//   if (!isConnected) {
	//     setToken({
	//       token: '',
	//       deepLink: ''
	//     })
	//   }
	// }, [isConnected, setToken])

	// if (typeof window === 'undefined') {
	//   return null
	// }

	return (
		<div className='h-screen mx-4 -mt-16'>
			<Head>
				<title>Login</title>
			</Head>
			<div className='h-full text-justify text-th-text '>
				<div className='flex flex-col justify-center max-w-xl min-h-full gap-4 mx-auto space-y-1 overflow-y-scroll scrollbar-none '>
					<h2>Login With Warpcast</h2>
					<div id='qr-login' />
				</div>
			</div>
		</div>
	)
}

export default LoginPage
