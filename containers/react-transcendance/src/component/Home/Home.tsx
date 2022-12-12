import React from 'react';
import { useNavigate, Link } from 'react-router-dom'

import 'static/Home.scss'
import { RiCopyleftLine } from 'react-icons/ri'

function Home() {
  const navigate = useNavigate();
	return (
		<div className="Home">
      <h1>Welcome !</h1>
      <p>
      The aim of this website is for you
      to <Link to="/game">play pong</Link> with
      your friends (or strangers) and enjoy doing so.
      You should also be able
      to <Link to="/chat">discuss</Link> with
      them and check their stats by joining a channel.
      If you are the competitive type, you can also check
      some stats in <Link to="/profile">your profile</Link>.
      </p>
      <button onClick={()=>navigate("/game")}>Find a Match</button>
      
      <p><RiCopyleftLine fill="#ebdbb2"/> 2023<br/>
        Jessica Boisserand,
        Antoine Lemarchand,
        Justine Saint-Jalmes and
        Frederik Schlüter </p>
		</div>
	)
}

export default Home;
