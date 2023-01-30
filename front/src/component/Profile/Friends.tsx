import { Link } from 'react-router-dom';
import 'static/Profile/Friends.scss';
import UserImage from './UserImage';

function FriendCard(props: {username: string, status: string, key: number}) {
    const statusColor = (status: string) => {
      if (status === 'in game')
        return {background: '#b16286',}
      else if (status === 'online')
        return {background: '#b8bb26',}
      else
        return {background: '#cc241d',}
    }

    return (
      <Link to={'/profile/' + props.username} className="friend" key={props.key}>
        <UserImage username={props.username}/>
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
