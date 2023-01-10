import { Channel } from "../../utils/Message";
import { FaPlus, FaSearch, FaPen } from 'react-icons/fa'

function DisplayList(props: {
		joinedChannels: Channel[],
		currentChannel: Channel | undefined,
		setCurrentChannel: Function,
    modifyChannel: Function,
    userName: string,
	}) {
	const ChannelButtonStyle = (channel: Channel) => {
		return {
			backgroundColor:  props.currentChannel === undefined
    || channel.channelName !== props.currentChannel.channelName ?
      '#458588' : '#83a598',
      gridColumn: channel.admins.includes(props.userName) ? '1' : '1/3',
		}
	}


	return (
		<div className="channelList">
		{
		props.joinedChannels.map((channel: Channel, idx: number) =>
    <div className="Channel">
			<button
				key={idx}
				style={ChannelButtonStyle(channel)}
				onClick={()=>props.setCurrentChannel(channel)}
				>
				{
          !channel.channelName.includes('_') ? channel.channelName :
          '☺ ' + (channel.channelName.split('_')[0] === props.userName ?
          channel.channelName.split('_')[1] : channel.channelName.split('_')[0])
        }</button>
        {
          channel.admins.includes(props.userName) &&
          <button
          onClick={()=>props.modifyChannel(channel.channelName)}>
          <FaPen /></button>
        }
    </div>
		)}
		</div>
	)
}

function ChannelMenu(props: {currentChannel: Channel | undefined,
	setCurrentChannel: Function,
	joinedChannel: Channel[],
	SetNewConvMenu: Function,
	SetSearchMenu: Function,
  modifyChannel: Function,
  userName: string,
	}) {
	return (
			<div className="channelMenu">
				<header>
					<button onClick={()=>props.SetSearchMenu(true)}>
						<FaSearch /></button>
					<button onClick={()=>props.SetNewConvMenu(true)}>
						<FaPlus /></button>
				</header>
				<DisplayList
					joinedChannels={props.joinedChannel}
					currentChannel={props.currentChannel}
					setCurrentChannel={props.setCurrentChannel}
          modifyChannel={props.modifyChannel}
          userName={props.userName}
				/>
			</div>
		);
}

export default ChannelMenu;
