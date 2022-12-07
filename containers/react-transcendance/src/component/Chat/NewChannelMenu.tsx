import * as React from 'react';
import { useState } from 'react';
import 'static/Chat/NewChannelMenu.scss';

function NewChannelMenu(props: {
	toggle: React.MouseEventHandler<HTMLDivElement>,
	setChannels: Function,
	visible: boolean,
	}) {

	const [choiceIndex, setChoiceIndex] = useState(1);

	const MenuClick = (event: any) => {
		event.stopPropagation();
	}

	const TabStyle = (index: number): React.CSSProperties => {
		return index === choiceIndex ? {background: '#98971a'} : {background: '#b8bb26'}
	}

	return (
		<div className="NewChannelMenu" style={
			{display: !props.visible ? "none" : "flex"}} onClick={props.toggle}>
			<div className="choiceBox" onClick={MenuClick}>
				<header>
					<button
						onClick={()=>setChoiceIndex(1)}
						style={TabStyle(1)}
						>Direct message</button>
					<button
						onClick={()=>setChoiceIndex(2)}
						style={TabStyle(2)}
						>Group message</button>
				</header>
				<div className="content">
					<div className="choice" style={choiceIndex !== 1 ?
						{display: "none"}: {}}>
						<input type="text" placeholder="UserName"/>
						<button>Contact user</button>
					</div>
					<div className="choice" style={choiceIndex !== 2 ?
						{display: "none"}: {}}>
						<input type="text" placeholder="Name"/>
						<input type="text" placeholder="Password"/>
						<button>Create Conversation</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NewChannelMenu;
