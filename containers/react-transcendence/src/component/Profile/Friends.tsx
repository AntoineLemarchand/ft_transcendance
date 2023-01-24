import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import 'static/Profile/Friends.scss'

function FriendCard(props: {username: string, status: string, key: number}) {
    const [imageURL, setImageURL] = useState('');
    const statusColor = (status: string) => {
      if (status === 'in game')
        return {background: '#b16286',}
      else if (status === 'online')
        return {background: '#b8bb26',}
      else
        return {background: '#cc241d',}
    }

    useEffect(() => {
        fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/user/image/" + props.username, {
          credentials: "include",
          method: "GET",
        }).then(response => {
          response.blob().then( (blob: Blob) => {
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                setImageURL(event.target!.result as string);
            }
            fileReader.readAsDataURL(blob);
          })
        })
    }, [])


    return (
      <Link to={'/profile/' + props.username} className="friend" key={props.key}>
        <img src={imageURL} alt="avatar"/>
        <p>{props.username}</p>
        <div className="status">
          <p>{props.status}</p>
          <span style={statusColor(props.status)}/>
        </div>
      </Link>
    )
}

function Friends(props: {isSelected: boolean, friends: {username: string, status: string}[]}) {
	return (
    <div
      className="Friends"
      style={{display: props.isSelected ? "block" : "none"}}>
      <h1>Friends</h1>
      <div className="friendList">{
        props.friends.map((friend: any, idx: number) => {
          return <FriendCard
            username={friend.username}
            status={friend.status}
            key={idx}
          />
        })
      }
      </div>
    </div>
  )
}

export default Friends;
