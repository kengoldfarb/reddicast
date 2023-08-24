const semanticReleaseConfig = require('@kengoldfarb/semantic-release-config')

const config = semanticReleaseConfig.default({
	branches: [
		'main',
		{ name: 'dev', prerelease: true },
		{ name: 'alpha', prerelease: true },
		{ name: 'stage', prerelease: true },
		{ name: 'qa', prerelease: true },
		{ name: 'uat', prerelease: true },
		{ name: 'canary', prerelease: true }
	]
})

module.exports = config
