import { pan, startPan, types, zoom } from './actions'
import reducer, { initialState } from './reducer'
import { useReducer, useRef } from 'react'
const usePanAndZoom = () => {
	const [state, dispatch] = useReducer(reducer, initialState)
	const containerRef = useRef<HTMLDivElement>(null)
	const onMouseMoveInWindow = (event) => {
		event.preventDefault()
		dispatch(pan(event))
	}
	const onMouseUpInWindow = () => {
		window.removeEventListener('mouseup', onMouseUpInWindow)
		window.removeEventListener('mousemove', onMouseMoveInWindow)
	}
	const onMouseDown = (event) => {
		dispatch(startPan(event))
		window.addEventListener('mouseup', onMouseUpInWindow)
		window.addEventListener('mousemove', onMouseMoveInWindow)
	}
	const onWheel = (event) => {
		if (event.deltaY !== 0 && containerRef.current) {
			const containerRect = containerRef.current.getBoundingClientRect()
			dispatch(zoom(event, containerRect))
		}
	}
	const onReset = () => {
		dispatch({ type: types.RESET })
	}
	return {
		...state,
		containerRef,
		onMouseDown,
		onWheel,
		onReset
	}
}

export default usePanAndZoom
