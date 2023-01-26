import ToggleButton from './ToggleButton'
import { Channel } from "../../utils/Message";
import { FaPlus, FaSearch } from 'react-icons/fa'

function DisplayList(props: {
		joinedChannels: Channel[],
		currentChannel: Channel | undefined,
		setCurrentChannel: Function,
	}) {
	const ChannelButtonStyle = (channel: Channel) => {
		return props.currentChannel === undefined
    || channel.channelName !== props.currentChannel.channelName ? {
			backgroundColor:  '#458588',
		} : {
			backgroundColor:  '#83a598',
			border: 'inset .2rem #a89984'
		}
	}

	return (
		<div className="channelList">
		{
		props.joinedChannels.map((channel: Channel, idx: number) =>
			<button
				key={idx}
				style={ChannelButtonStyle(channel)}
				onClick={()=>props.setCurrentChannel(channel)}
				>
				{channel.channelName}</button>
		)}
		</div>
	)
}

function ChannelMenu(props: {currentChannel: Channel | undefined,
	setCurrentChannel: Function,
	joinedChannel: Channel[],
	SetNewConvMenu: Function,
	SetSearchMenu: Function,
	}) {

	return (
			<div className="channelMenu">
				<header>
					<ToggleButton
						toggle={()=>props.SetSearchMenu(true)}
						icon={<FaSearch />}
          />
					<ToggleButton
						toggle={()=>props.SetNewConvMenu(true)}
						icon={<FaPlus />}
          />
				</header>
				<DisplayList
					joinedChannels={props.joinedChannel}
					currentChannel={props.currentChannel}
					setCurrentChannel={props.setCurrentChannel}
				/>
			</div>
		);
}

export default ChannelMenu;
