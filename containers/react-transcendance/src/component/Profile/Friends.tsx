import 'static/Profile/Friends.scss'

function Friends(props: {isSelected: boolean}) {
  const friends = [
    {
      name: 'aasli',
      avatar: 'https://cdn.intra.42.fr/users/3d6930f126ba05fd5869fa81082f47f5/aasli.jpg',
      status: 'online',
    },
    {
      name: 'aasli',
      avatar: 'https://cdn.intra.42.fr/users/3d6930f126ba05fd5869fa81082f47f5/aasli.jpg',
      status: 'offline',
    },
    {
      name: 'aasli',
      avatar: 'https://cdn.intra.42.fr/users/3d6930f126ba05fd5869fa81082f47f5/aasli.jpg',
      status: 'in game',
    },
    {
      name: 'aasli',
      avatar: 'https://cdn.intra.42.fr/users/3d6930f126ba05fd5869fa81082f47f5/aasli.jpg',
      status: 'offline',
    },
    {
      name: 'aasli',
      avatar: 'https://cdn.intra.42.fr/users/3d6930f126ba05fd5869fa81082f47f5/aasli.jpg',
      status: 'online',
    },
  ]

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
        friends.map((friend: any, idx: number) => {
          return (
            <div class="friend">
              <img src={friend.avatar} alt="friend avatar"/>
              <p>{friend.name}</p>
              <div className="status">
                <p>{friend.status}</p>
                <span style={statusColor(friend.status)}/>
              </div>
            </div>
          )
        })
      }
      </div>
    </div>
  )
}

export default Friends;
