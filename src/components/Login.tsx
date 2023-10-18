/* eslint-disable @next/next/no-img-element */

import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { AiOutlineGithub } from 'react-icons/ai'
import packageInfo from '../../package.json'
const _VERSION = packageInfo.version
const _link = 'text-th-link hover:underline hover:text-th-linkHover '
// import { useCheckSigner, useToken, useSigner } from '@farsign/hooks'
import { useUser } from '../hooks/useUser'
import { useRouter } from 'next/router'
import { useToken } from '@farsign/hooks'
import * as ed from '@noble/ed25519'

let QRCode
if (typeof window !== 'undefined') {
	QRCode = require('qrcodejs2')
}

export type Keypair = {
	publicKey: string
	privateKey: string
}

export async function generateKeyPair(): Promise<Keypair> {
	const privateKey = ed.utils.randomPrivateKey()
	const publicKey = await ed.getPublicKeyAsync(privateKey)

	return {
		publicKey: Buffer.from(publicKey).toString('hex'),
		privateKey: Buffer.from(privateKey).toString('hex')
	}
}

const CLIENT_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? ''

const LoginPage: React.FC = () => {
	const [qrcode, setQRCode] = useState<undefined | any>()
	const router = useRouter()
	// const { signer, user } = useUser()
	const [token, _setToken] = useToken(CLIENT_NAME)

	// useEffect(() => {
	// 	if (typeof window === 'undefined') {
	// 		return
	// 	}
	// 	if (qrcode) {
	// 		qrcode.clear()
	// 		qrcode.makeCode(token.deepLink)
	// 	} else {
	// 		const q = new QRCode(document.getElementById('qr-login'), {
	// 			text: token.deepLink,
	// 			width: 400,
	// 			height: 400,
	// 			colorDark: '#000000',
	// 			colorLight: '#ffffff',
	// 			correctLevel: QRCode.CorrectLevel.H
	// 		})
	// 		setQRCode(q)
	// 	}
	// }, [token, qrcode])

	// useEffect(() => {
	// 	if (signer.isConnected) {
	// 		// router.push('/')
	// 	}

	// 	console.log({ signer, token, user })
	// }, [signer])

	// console.log({ signer, token, user })
	console.log({ token })

	return (
		<div className="h-screen mx-4 -mt-16">
			<Head>
				<title>Login | ReddiCast</title>
			</Head>
			<div className="h-full text-justify text-th-text">
				<div className="flex flex-col justify-center max-w-xl min-h-full gap-4 mx-auto space-y-1 overflow-y-scroll scrollbar-none align-middle text-center">
					<h2>Login With Warpcast</h2>
					<div id="qr-login" className="flex justify-around" />
				</div>
			</div>
		</div>
	)
}

export default LoginPage
