import * as React from 'react';

import '../static/Main.scss'

import {
	FaHome,
	FaTableTennis,
	FaCommentDots,
	FaUser,
	FaDoorOpen
	} from 'react-icons/fa'

import Home from './Home'
import Play from './Play'
import Chat from './Chat'
import Profile from './Profile'
import Header from './Header'

const pages = [
	{ icon: <FaHome/>, ref: 'Home', component: <Home/>},
	{ icon: <FaTableTennis/>, ref: 'Play', component: <Play/>},
	{ icon: <FaCommentDots/>, ref: 'Discuss', component: <Chat/>},
	{ icon: <FaUser/>, ref: 'Profile', component: <Profile/>},
	{ icon: <FaDoorOpen/>, ref: 'Profile', component: null}
];

function Main() {
	return (
			<div className="Main">
				<Header></Header>
				<div className="links">
				{
					pages.map((page, idx) => 
						<a href={'#' + page.ref} key={idx}>
							{page.icon}
						</a>
					)
				}
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
			</div>
		   )
}

export default Main;

