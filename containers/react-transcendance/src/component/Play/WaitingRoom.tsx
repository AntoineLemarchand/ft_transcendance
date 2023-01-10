import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import 'static/Play/WaitingRoom.scss'

function WaitingRoom() {
  const navigate = useNavigate();
  const [dotAmount, setDotAmount] = useState('')

  useEffect(()=> {
    setTimeout( ()=>{
      setDotAmount(dotAmount + '.');
      if (dotAmount === '...')
        setDotAmount('');
    }, 500)
  })

  return (
    <div className="waitingRoom">
      <div className="Prompt">
        <p>waiting for a game{dotAmount}</p>
        <button onClick={()=>navigate('/game')}>Back</button>
      </div>
    </div>
  )
}

export default WaitingRoom;
