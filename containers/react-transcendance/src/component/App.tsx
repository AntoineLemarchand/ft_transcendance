import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useCookies } from 'react-cookie'

import Main from './Main'
import NotFound from './NotFound'
import Header from './Header'
import Login from './Account/Login'
import SignIn from './Account/SignIn'

import Home from './Home/Home'
import Play from './Play/Play'
import Spectate from './Play/Spectate'
import Chat from './Chat/Chat'
import Profile from './Profile/Profile'


import '../static/App.scss'

function App() {
  const [cookie] = useCookies(['userInfo']);
	return (
	<div className="App">
		<BrowserRouter>
		<Header/>
		<Routes>
			<Route path="/" element={ <Login /> }/>
			<Route path="/signin" element={ <SignIn /> }/>
			<Route path="/home" element={ <Main component={<Home />}/>}/>
			<Route path="/game" element={ <Main component={<Play />}/>}/>
			<Route path="/game/:gid" element={ <Main component={<Play />}/>}/>
			<Route path="/spectate" element={ <Main component={<Spectate />}/>}/>
			<Route path="/chat" element={ <Main component={<Chat />}/>}/>
			<Route path="/profile" element={ <Main component={<Profile user={cookie['userInfo']}/>}/>}/>
			<Route path="/profile/:uid" element={ <Main component={<Profile user={cookie['userInfo']}/>}/>}/>
			<Route path="/*" element={ <NotFound /> }/>
		</Routes>
		</BrowserRouter>
	</div>
	)
}
export default App;
