import * as React from 'react';
import { useState } from 'react';
import 'static/Chat/NewChannelMenu.scss';

function NewChannelMenu(props: {
	toggle: React.MouseEventHandler<HTMLDivElement>,
  callback: Function,
	visible: boolean,
	}) {

  const [channelName, setChannelName] = useState('');
  const [channelPassword, setChannelPassword] = useState('');

  const NewChannel = () => {
    fetch('http://localhost:3000/channel/join', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
          'channelName': channelName,
          'channelPassword': channelPassword,
      }),
    }).then(response=>{
      if (response.status !== 201)
        alert("Could not create nor find channel");
      else {
        props.callback();
        setChannelName('');
        setChannelPassword('');
        props.toggle();
      }
    })
  }

	return (
		<div className="NewChannelMenu" style={
			{display: !props.visible ? "none" : "flex"}} onClick={props.toggle}>
			<div className="choiceBox" onClick={(event=>{event.stopPropagation()})}>
          <input type="text"
            placeholder="Name"
            onChange={(event)=>{setChannelName(event.target.value)}}
            value={channelName}
            />
          <input type="password"
            placeholder="Password"
            onChange={(event)=>{setChannelPassword(event.target.value)}}
            value={channelPassword}
            />
          <button onClick={NewChannel}>Create Conversation</button>
			</div>
		</div>
	)
}

export default NewChannelMenu;
