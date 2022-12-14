import * as React from 'react'
import { FaPlus } from 'react-icons/fa'

function NewChannelButton(props: {toggle: Function, style: React.CSSProperties}) {
	const ToggleNewChannelMenu = () => {
		props.toggle();
	}

	return (
	<button
		className="NewChannelButton"
		onClick={ToggleNewChannelMenu}
    style={props.style}
		>
		<FaPlus />
	</button>
)}

export default NewChannelButton;
