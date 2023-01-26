import * as React from 'react'

function ToggleButton(props: {toggle: Function, icon: any}) {
	const ToggleNewChannelMenu = () => {
		props.toggle();
	}

	return (
	<button
		className="NewChannelButton"
		onClick={ToggleNewChannelMenu}
		>
		{props.icon}
	</button>
)}

export default ToggleButton;
