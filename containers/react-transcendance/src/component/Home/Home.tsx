import React from 'react';

import 'static/Home.scss'

function Home() {
	return (
		<div className="Home">
			<div className="content">
				<h1>Welcome !</h1>
				<p>
				The aim of this website is for you
				to <a href="#Play">play pong</a> with
				your friends (or strangers) and enjoy doing so.
				You should also be able
				to <a href="#Discuss">discuss</a> with
				them and check their stats by joining a channel.
				If you are the competitive type, you can also check
				some stats in <a href="#Profile">your profile</a>.
				</p>
			</div>
				<button>Find a Match</button>
		</div>
	)
}

export default Home;
