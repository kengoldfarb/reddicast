import HtmlToReact from 'html-to-react'
import React, { useEffect, useState } from 'react'
import ParseATag from '../components/ParseATag'
/* eslint-disable react/display-name */

const HtmlToReactParser = HtmlToReact.Parser
const htmlToReactParser = new HtmlToReactParser()
const isValidNode = function () {
	return true
}

// Order matters. Instructions are processed in the order they're defined
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React)
const processingInstructions = [
	{
		shouldProcessNode(node) {
			const check =
				node.parent?.name &&
				node.parent.name === 'a' &&
				node.parent?.attribs?.href?.includes('https://') &&
				checkSupport(node.parent?.attribs?.href, node) &&
				node.name !== 'img' //leave comment gifs alone
			return check
		},
		processNode(node, _children, index) {
			return React.createElement(ParseATag, { key: index }, node) //node?.data?.toUpperCase();
		}
	},
	{
		// Anything else
		shouldProcessNode(_node) {
			return true
		},
		processNode: processNodeDefinitions.processDefaultNode
	}
]
const checkSupport = (link: string, node: any) => {
	//prevent recurring nodes from all having expansion buttons
	if (node?.next?.parent?.attribs?.href === link) {
		return false
	}

	const imgurRegex = /([A-z.]+\.)?(imgur(\.com))+(\/)+([A-z0-9]){7}\./gm
	const redditRegex =
		/(preview+\.)+(reddit(\.com)|redd(\.it))+(\/[A-z0-9]+)+(\.(png|jpg))\./gm
	const greedyRegex = /(\.(png|jpg))/gm
	return !!(
		link.match(imgurRegex) ||
		link.match(redditRegex) ||
		link.match(greedyRegex)
	)
}

const useParseBodyHTML = ({ rawHTML, newTabLinks = false }) => {
	const [component, setComponent] = useState<any>()

	useEffect(() => {
		const PROTOCOL = window.location.protocol
		const DOMAIN = window?.location?.host ?? 'reddica.st'

		const blankTargets = str => {
			if (str?.includes('<a ')) {
				str = str?.replaceAll('<a ', '<a target="_blank" rel="noreferrer" ')
			}
			return str
		}

		const replaceDomains = str => {
			if (typeof str === 'undefined' || !str) return
			const splitstr = str.split('<a')
			const replaceall: string[] = []
			splitstr.forEach(substr => replaceall.push(replaceUserDomains(substr)))
			return replaceall.join('<a')
		}

		const replaceUserDomains = (str: string) => {
			const redditRegex = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))/gm
			const matchRegex1 = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))+(\/[ru]\/)/gm
			const matchRegex2 = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))+(\/user\/)/gm
			const matchRegex3 =
				/([A-z.]+\.)?(reddit(\.com)|redd(\.it))+(\/)+([A-z0-9]){6}("|\s)/gm
			// let youtubeRegex = /([A-z.]+\.)?youtu(be\.com|\.be)/gm;
			// let twitterRegex = /([A-z.]+\.)?twitter\.com/gm;
			// let instagramRegex = /([A-z.]+\.)?instagram.com/gm;
			if (
				str.match(matchRegex1) ||
				str.match(matchRegex2) ||
				str.match(matchRegex3)
			) {
				str = str.replace(redditRegex, DOMAIN) //.replace(/(https:\/\/|http:\/\/)/g,PROTOCOL);
				if (str.includes('https:') && PROTOCOL !== 'https:') {
					str = str.replace('https:', PROTOCOL)
				}
			}

			return str
		}

		const parseHTML = html => {
			const reactElement = htmlToReactParser.parseWithInstructions(
				html,
				isValidNode,
				processingInstructions
			)
			return reactElement
		}

		//let unescaped = unescape(html); //no longer need this due to html-to-react
		let result = replaceDomains(rawHTML)
		if (newTabLinks) {
			result = blankTargets(result)
		}
		const reactElement = parseHTML(result)
		setComponent(reactElement)
	}, [rawHTML])

	return component
}

export default useParseBodyHTML
