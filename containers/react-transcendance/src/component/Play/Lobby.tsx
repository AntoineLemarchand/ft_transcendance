import * as React from 'react'
import { useState } from 'react'

import Spectate from './Spectate'

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

  const lobby = <div class="MatchMaking">
      <div className="Invite">
        Invite a friend
      </div>
      <div className="Random">
        Find a Match
      </div>
    </div>

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
      {tabIndex === 0 ? lobby : <Spectate />}
    </div>
  )
}

export default Lobby;
