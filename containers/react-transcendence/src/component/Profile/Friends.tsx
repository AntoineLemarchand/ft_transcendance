import 'static/Profile/Friends.scss'
import { Link } from 'react-router-dom'

function Friends(props: {isSelected: boolean, friends: {username: string, status: string}[]}) {
  const statusColor = (status: string) => {
    if (status === 'in game')
      return {background: '#b16286',}
    else if (status === 'online')
      return {background: '#b8bb26',}
    else
      return {background: '#cc241d',}
  }

	return (
    <div
      className="Friends"
      style={{display: props.isSelected ? "block" : "none"}}>
      <h1>Friends</h1>
      <div className="friendList">
      {
        props.friends.map((friend: any, idx: number) => {
          return (
            <Link to={'/profile/' + friend.username} className="friend" key={idx}>
              <img alt="friend avatar"/>
              <p>{friend.username}</p>
              <div className="status">
                <p>{friend.status}</p>
                <span style={statusColor(friend.status)}/>
              </div>
            </Link>
          )
        })
      }
      </div>
    </div>
  )
}

export default Friends;
