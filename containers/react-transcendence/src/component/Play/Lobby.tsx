import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Spectate from './Spectate'
import 'static/Play/Lobby.scss'

function Lobby() {
  const [tabIndex, setTabIndex] = useState(0);

  const tabStyle = (index: number) => {
    return index === tabIndex ? {
      background: '#83a598',
      border: 'inset .2rem #a89984'
    } : {
      background: '#458588',
    }
  }

  const invites = []

  function Lobby() {
    const navigate = useNavigate();

    return (
      <div className="MatchMaking">
          <button
            className="JoinQueue"
            onClick={()=>navigate('/waitingroom')}
          >Join Matchmaking</button>
          <div className="Invites">
          {
            invites.map((invite, idx) => {
              if (invite.status === 'online') {
                return (
                  <button
                    key={idx}
                    className="Invite"
                    onClick={()=>navigate('/game/' + invite.name)}
                    >
                    <img src={invite.avatar} alt="avatar" />
                    <p>{invite.name.slice(0,10) + (invite.name.length > 10 ? '...' : '')}</p>
                  </button>
                )
              }
            })
           }
        </div>
      </div>
    )
  }

  return (
    <div className="Lobby">
      <div className="tabs">
        <button
          onClick={()=>setTabIndex(0)}
          style={tabStyle(0)}
        >Play</button>
        <button
          onClick={()=>setTabIndex(1)}
          style={tabStyle(1)}
        >Spectate</button>
      </div>
      {tabIndex === 0 ? <Lobby /> : <Spectate />}
    </div>
  )
}

export default Lobby;
