import { Channel } from "../../utils/Message";
import { FaPlus, FaSearch, FaPen, FaTimes } from "react-icons/fa";

function DisplayList(props: {
  joinedChannels: Channel[];
  currentChannel: Channel | undefined;
  setCurrentChannel: Function;
  modifyChannel: Function;
  username: string;
  updateChannels: Function;
}) {
  const ChannelButtonStyle = (channel: Channel) => {
    return {
      backgroundColor:
        props.currentChannel === undefined ||
        channel.channelName !== props.currentChannel.channelName
          ? "#458588"
          : "#83a598",
      gridColumn:
        channel.admins.includes(props.username) &&
        channel.channelName.indexOf("_") === -1
          ? "1"
          : "1/4",
    };
  };

  const LeaveChannel = (channelName: string) => {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/channel/join", {
        credentials: "include",
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: channelName,
        }),
      }).then((result) => {
        if (result.status === 401)
          alert("You cannot leave a channel you created");
        else {
          props.updateChannels();
          props.setCurrentChannel(undefined);
        }
      });
  };

  return (
    <div className="channelList">
      {props.joinedChannels.map((channel: Channel, idx: number) => (
        <div className="Channel" key={idx}>
          <button
            style={ChannelButtonStyle(channel)}
            onClick={() => props.setCurrentChannel(channel)}
          >
            {!channel.channelName.includes("_")
              ? channel.channelName
              : "☺ " +
                (channel.channelName.split("_")[0] === props.username
                  ? channel.channelName.split("_")[1]
                  : channel.channelName.split("_")[0])}
          </button>
          {!channel.channelName.includes('_') && <button
            className="leaveButton"
            onClick={() => LeaveChannel(channel.channelName)}
          ><FaTimes /></button>}
          {channel.admins.includes(props.username) &&
            channel.channelName.indexOf("_") === -1 && (
              <button
                className="editButton"
                onClick={() => props.modifyChannel(channel.channelName)}
              >
                <FaPen />
              </button>
            )}
        </div>
      ))}
    </div>
  );
}

function ChannelMenu(props: {
  currentChannel: Channel | undefined;
  setCurrentChannel: Function;
  joinedChannel: Channel[];
  SetNewConvMenu: Function;
  SetSearchMenu: Function;
  modifyChannel: Function;
  username: string;
  updateChannels: Function;
}) {
  return (
    <div className="channelMenu">
      <header>
        <button onClick={() => props.SetSearchMenu(true)}>
          <FaSearch />
        </button>
        <button onClick={() => props.SetNewConvMenu(true)}>
          <FaPlus />
        </button>
      </header>
      <DisplayList
        joinedChannels={props.joinedChannel}
        currentChannel={props.currentChannel}
        setCurrentChannel={props.setCurrentChannel}
        modifyChannel={props.modifyChannel}
        username={props.username}
        updateChannels={props.updateChannels}
      />
    </div>
  );
}

export default ChannelMenu;
