import * as React from 'react'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

function NewChannelButton(props: {toggle: Function}) {
	const ToggleNewChannelMenu = () => {
		props.toggle();
	}

	return (
	<button
		className="NewChannelButton"
		onClick={ToggleNewChannelMenu}
		>
		<FaPlus />
	</button>
)}

export default NewChannelButton;
