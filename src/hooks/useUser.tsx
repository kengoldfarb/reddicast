import { NobleEd25519Signer } from '@farcaster/hub-web'
import { generateKeyPair, sendPublicKey } from '@farsign/utils'
import { ethers } from 'ethers'
import React, {
	createContext,
	useMemo,
	useContext,
	ReactNode,
	useEffect,
	useCallback,
	useState
} from 'react'
import request from 'superagent'

export type Token = {
	token: string
	deepLink: string
}

export type Keypair = {
	privateKey: Uint8Array
	publicKey: Uint8Array
}

type SignerData = {
	token: string
	publicKey: string
	timestamp: number
	name: string
	fid: number
	messageHash: string
	base64SignedMessage: string
}

type Signer = {
	signerRequest: SignerData
	isConnected: boolean
}

const requestSignerAuthStatus = async (token: string) => {
	const result = await request
		.get('https://api.warpcast.com/v2/signer-request')
		.query({
			token
		})

	console.log({ body: result.body })

	return result.body
}

const getUser = async (fid: number) => {
	const result = await request.get('/api/farcaster/user').query({
		fid
	})

	console.log({ body: result.body })

	return result.body.user
}

export interface IUser {
	fid: number
	fname?: string
	bio?: string
	displayName?: string
	pfp?: string
}

export interface ISDKContextState {
	token: Token
	signer: Signer
	user: IUser | null
}

const UserContext = createContext({} as ISDKContextState)
UserContext.displayName = 'UserContext'

export interface ISDKProps {
	children?: ReactNode
}

const CLIENT_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'feddit'

export const UserProvider: React.FC<ISDKProps> = ({ ...props }: ISDKProps) => {
	const [isConnected, setIsConnected] = useState(false)
	const [user, setUser] = useState<IUser | null>(null)

	const [signer, setSigner] = useState<Signer>({
		signerRequest: {
			token: '',
			publicKey: '',
			timestamp: 0,
			name: '',
			fid: 0,
			messageHash: '',
			base64SignedMessage: ''
		},
		isConnected: false
	})

	const [token, setToken] = useState<Token>({
		token: '',
		deepLink: ''
	})

	const [encryptedSigner, setEncryptedSigner] = useState<NobleEd25519Signer>()

	useEffect(() => {
		const go = async () => {
			if (signer && signer.signerRequest.fid > 0) {
				const u = await getUser(signer.signerRequest.fid)
				setUser(u)
			} else {
				setUser(null)
			}
		}

		go()
	}, [signer])

	useEffect(() => {
		if (token.token.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const privateKey = localStorage.getItem(
				'farsign-privateKey-' + CLIENT_NAME
			)!

			const privateKeyEncoded = Uint8Array.from(
				privateKey.split(',').map(split => Number(split))
			)
			setEncryptedSigner(new NobleEd25519Signer(privateKeyEncoded))
		}
	}, [token])

	useEffect(() => {
		;(async () => {
			if (localStorage.getItem('farsign-signer-' + CLIENT_NAME) != null) {
				setToken({
					token: 'already connected',
					deepLink: 'already connected'
				})
			} else {
				const { publicKey, privateKey } = await generateKeyPair()
				const { token: t, deepLinkUrl } = await sendPublicKey(
					publicKey,
					CLIENT_NAME
				)

				localStorage.setItem(
					'farsign-privateKey-' + CLIENT_NAME,
					privateKey.toString()
				)

				setToken({ token: t, deepLink: deepLinkUrl })
			}
		})()
	}, [])

	useEffect(() => {
		if (localStorage.getItem('farsign-signer-' + CLIENT_NAME) === null) {
			;(async () => {
				if (token.token.length > 0) {
					// eslint-disable-next-line no-constant-condition
					while (true) {
						await new Promise(resolve => setTimeout(resolve, 3000))

						const data = await requestSignerAuthStatus(token.token)

						if (data.result && data.result.signerRequest.base64SignedMessage) {
							localStorage.setItem(
								'farsign-signer-' + CLIENT_NAME,
								JSON.stringify(data.result)
							)

							setSigner({
								signerRequest: data.result.signerRequest,
								isConnected: true
							})
							setIsConnected(true)
							break
						}
					}
				}
			})()
		} else {
			setSigner({
				...(JSON.parse(
					localStorage.getItem('farsign-signer-' + CLIENT_NAME)
				) as Signer),
				isConnected: true
			})
			setIsConnected(true)
		}
	}, [token])

	useEffect(() => {
		if (isConnected) {
			// Fetch the user
		}
	}, [isConnected])

	const value = useMemo(
		() => ({
			token,
			signer,
			encryptedSigner,
			isConnected,
			user
		}),
		[token, signer, encryptedSigner, isConnected, user]
	)

	return <UserContext.Provider value={value} {...props} />
}

export function useUser() {
	const context = useContext(UserContext)

	if (typeof context === 'undefined') {
		throw new Error(`useUser must be used within a UserProvider`)
	}

	return context
}
