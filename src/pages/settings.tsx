import Settings from '../components/settings/Settings'
import React from 'react'

const SettingsPage = () => {
	return (
		<div className='flex flex-col items-center justify-center h-[calc(100vh-7.5rem)] mx-auto '>
			<div className=''>
				<Settings />
			</div>
		</div>
	)
}

export default SettingsPage
