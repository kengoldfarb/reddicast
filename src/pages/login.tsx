/* eslint-disable @next/next/no-img-element */

import packageInfo from '../../package.json'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { AiOutlineGithub } from 'react-icons/ai'
const _VERSION = packageInfo.version
const _link = 'text-th-link hover:underline hover:text-th-linkHover '
import Login from '../components/Login'
import NoSSR from '../components/NoSSR'
import { useToken } from '@farsign/hooks'
import dynamic from 'next/dynamic'
// const QRCode = dynamic(() => import('qrcodejs2'), {
//   ssr: false
// })
// let QRCode
// if (typeof window !== 'undefined') {
//   QRCode = require("qrcodejs2");
// }

const LoginPage = ({ changelog }) => {
	// const [token, _setToken] = useToken('PrivateApp');

	// console.log({token, QRCode})

	// useEffect(() => {
	//   if (typeof window === 'undefined') {
	//     return
	//   }
	//   new QRCode(document.getElementById("qr-login"), {
	//     text: token.deepLink,
	//     width: 128,
	//     height: 128,
	//     colorDark : "#000000",
	//     colorLight : "#ffffff",
	//     correctLevel : QRCode.CorrectLevel.H
	//   });
	// }, [token])

	return (
		<div className='h-screen mx-4 -mt-16'>
			<Head>
				<title>Login</title>
			</Head>
			<NoSSR>
				<Login />
			</NoSSR>
		</div>
	)
}

export default LoginPage
