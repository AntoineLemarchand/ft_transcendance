import * as React from 'react';
import { useNavigate } from 'react-router-dom'

import 'static/Main.scss'

import {
	FaHome,
	FaTableTennis,
	FaCommentDots,
	FaUser,
	FaDoorOpen
	} from 'react-icons/fa'

import { HiVideoCamera } from 'react-icons/hi'

import Home from './Home/Home'
import Play from './Play/Play'
import Spectate from './Play/Spectate'
import Chat from './Chat/Chat'
import Profile from './Profile/Profile'

function Main() {
	const navigate = useNavigate();

	const ProcessLogout = () => {
		navigate('/');
	}

	const pages = [
		{ icon: <FaHome/>, ref: 'Home', component: <Home/>},
		{ icon: <FaTableTennis/>, ref: 'Play', component: <Play/>},
		{ icon: <HiVideoCamera/>, ref: 'Spectate', component: <Spectate/>},
		{ icon: <FaCommentDots/>, ref: 'Discuss', component: <Chat/>},
		{ icon: <FaUser/>, ref: 'Profile', component: <Profile/>},
	];

	return (
			<main>
				<div className="links">
				{
					pages.map((page, idx) => 
						<a href={'#' + page.ref} key={idx}>
							{page.icon}
						</a>
					)
				}
				<button onClick={ProcessLogout}>
					<FaDoorOpen />
				</button>
				</div>
				<div className="slides">
				{
					pages.map((page, idx) => 
					 <div id={page.ref} className="component-wrapper" key={idx}>
						{page.component}
					 </div>
					)
				}
				</div>
			</main>
		   )
}

export default Main;

