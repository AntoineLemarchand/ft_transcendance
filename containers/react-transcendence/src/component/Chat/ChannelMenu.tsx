import { Channel } from "../../utils/Message";
import { FaPlus, FaSearch, FaPen } from 'react-icons/fa'

function DisplayList(props: {
		joinedChannels: Channel[],
		currentChannel: Channel | undefined,
		setCurrentChannel: Function,
    modifyChannel: Function,
    username: string,
	}) {
	const ChannelButtonStyle = (channel: Channel) => {
		return {
			backgroundColor:  props.currentChannel === undefined
    || channel.channelName !== props.currentChannel.channelName ?
      '#458588' : '#83a598',
      gridColumn: channel.admins.includes(props.username) &&
      channel.channelName.indexOf('_') === -1 ? '1' : '1/3',
		}
	}


	return (
		<div className="channelList">
		{
      props.joinedChannels.map((channel: Channel, idx: number) =>
        <div className="Channel" key={idx}>
        <button
          style={ChannelButtonStyle(channel)}
          onClick={()=>props.setCurrentChannel(channel)}
          >
          {
            !channel.channelName.includes('_') ? channel.channelName :
            '☺ ' + (channel.channelName.split('_')[0] === props.username ?
            channel.channelName.split('_')[1] : channel.channelName.split('_')[0])
          }</button>
          {
            channel.admins.includes(props.username) &&
            channel.channelName.indexOf('_') === -1 &&
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
  username: string,
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
          username={props.username}
				/>
			</div>
		);
}

export default ChannelMenu;
