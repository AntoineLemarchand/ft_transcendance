import { useEffect, useContext, useState } from "react";

import { GiHamburgerMenu } from "react-icons/gi";

import "static/Chat/Chat.scss";

import ChatName from "./ChatName";
import * as Menus from "./ChatMenus";
import ChannelMenu from "./ChannelMenu";
import { Channel, Message, putMessageInChannels } from "../../utils/Message";
import { useCookies } from "react-cookie";
import io from "socket.io-client";

function Chat() {
  const [NewConvMenu, SetNewConvMenu] = useState(false);
  const [SearchMenu, SetSearchMenu] = useState(false);
  const [channelToModify, setChannelToModify] = useState("");
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [currentMessage, setCurrentMessage] = useState("");
  const [joinedChannel, setJoinedChannel] = useState<Channel[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const [cookies, setCookie] = useCookies(["auth", "userInfo", "socket"]);

  const send = (sender: string, content: string, channel: string) => {
    cookies["socket"].emit(
      "messageToServer",
      JSON.stringify({ sender: sender, content: content, channel: channel })
    );
  };

  const updateJoinedChannels = () => {
    fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/user/channels", {
      credentials: "include",
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((result) => {
      result.text().then((text) => {
        setJoinedChannel(JSON.parse(text).channels);
        if (currentChannel === undefined && joinedChannel.length > 0)
          setCurrentChannel(joinedChannel[0]);
      });
    });
  };

  const updateBlockedUsers = () => {
    fetch(
      "http://" + process.env.REACT_APP_SERVER_IP + "/api/user/blockedUser",
      {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    ).then((response) => {
      response.text().then((content) => {
        setBlockedUsers(JSON.parse(content).blockedUsers);
      });
    });
  };

  useEffect(() => {
    updateJoinedChannels();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const messageListener = (payload: string) => {
      const message: Message = JSON.parse(payload);
      const allChannels = putMessageInChannels(message, joinedChannel);
      setJoinedChannel(allChannels);
    };
    if (!cookies["socket"]) {
      const newSocket = io("http://" + process.env.REACT_APP_SERVER_IP, {
        withCredentials: true,
        query: { auth: cookies["auth"] },
      });
      setCookie("socket", newSocket, { path: "/" });
      cookies["socket"].on("messageToClient", messageListener);
    } else {
      cookies["socket"].on("messageToClient", messageListener);
    }
    if (currentChannel === undefined && joinedChannel.length > 0)
      setCurrentChannel(joinedChannel[0]);
    return () => {
      cookies["socket"] &&
        cookies["socket"].off("messageToClient", messageListener);
    };
    // eslint-disable-next-line
  }, [joinedChannel]);

  useEffect(() => {
    updateBlockedUsers();
  }, [currentChannel]);

  const displayChannelContent = (currentChannel: Channel | undefined) => {
    if (currentChannel !== undefined)
      return currentChannel.messages.map((message: Message, idx: number) => (
        <li
          key={idx}
          className="message"
          style={{
            textAlign:
              message.sender === cookies["userInfo"].name ? "right" : "left",
          }}
        >
          <ChatName
            username={message.sender}
            sender={message.sender}
            channel={currentChannel}
            userName={cookies["userInfo"].name}
            updateContent={setCurrentChannel}
          />
          <p className="content">
            {blockedUsers.indexOf(message.sender) === -1
              ? message.content
              : "--- BLOCKED MESSAGE ---"}
          </p>
        </li>
      ));
  };

  const OnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && currentChannel !== undefined) {
      let messageContent: string = (event.target as any).value;
      send(
        cookies["userInfo"].name,
        messageContent,
        currentChannel.channelName
      );
      setCurrentMessage("");
    }
  };

  return (
    <div className="Chat">
      {channelToModify !== "" && (
        <Menus.ChannelModifyMenu
          channel={channelToModify}
          callback={() => setChannelToModify("")}
        />
      )}
      <Menus.NewChannelMenu
        toggle={() => {
          SetNewConvMenu(!NewConvMenu);
        }}
        callback={updateJoinedChannels}
        visible={NewConvMenu}
      />
      <Menus.SearchMenu
        toggle={() => {
          SetSearchMenu(!SearchMenu);
        }}
        callback={updateJoinedChannels}
        visible={SearchMenu}
      />
      <input className="burger" type="checkbox" id="burgerToggle" />
      <label htmlFor="burgerToggle">
        <GiHamburgerMenu />
      </label>
      <ChannelMenu
        currentChannel={currentChannel}
        setCurrentChannel={setCurrentChannel}
        modifyChannel={setChannelToModify}
        joinedChannel={joinedChannel}
        SetNewConvMenu={SetNewConvMenu}
        SetSearchMenu={SetSearchMenu}
        userName={cookies["userInfo"] && cookies["userInfo"].name}
      />
      <ul className="channelContent">
        <div className="chatArea">{displayChannelContent(currentChannel)}</div>
        <input
          type="text"
          placeholder="Say something smart !"
          value={currentMessage}
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyDown={OnKeyDown}
        />
      </ul>
    </div>
  );
}

export default Chat;
