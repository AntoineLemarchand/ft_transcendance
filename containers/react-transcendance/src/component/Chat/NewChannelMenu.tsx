import * as React from 'react';
import { useState } from 'react';

function NewChannelMenu(props: {
	toggle: React.MouseEventHandler<HTMLDivElement>,
	setChannels: Function,
	visible: boolean,
	}) {

	const [choiceIndex, setChoiceIndex] = useState(1);

	const MenuClick = (event: any) => {
		event.stopPropagation();
	}

	return (
		<div className="NewChannelMenu" style={
			{display: !props.visible ? "none" : "flex"}} onClick={props.toggle}>
			<div className="choiceBox" onClick={MenuClick}>
				<header>
					<button onClick={()=>setChoiceIndex(1)}>Direct message</button>
					<button onClick={()=>setChoiceIndex(2)}>Create channel</button>
				</header>
				<div className="content">
					<div className="choice" style={choiceIndex !== 1 ?
						{display: "none"}: {}}>
						<button>DirectMessage</button>
						<button>11111111111111</button>
						<button>11111111111111</button>
						<button>11111111111111</button>
					</div>
					<div className="choice" style={choiceIndex !== 2 ?
						{display: "none"}: {}}>
						<button>createChannel</button>
						<button>22222222222222</button>
						<button>22222222222222</button>
						<button>22222222222222</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NewChannelMenu;
