import { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';

import Main from './Main'
import NotFound from './NotFound'
import Header from './Header'
import Login from './Account/Login'
import SignIn from './Account/SignIn'
import TwoFactor from './Account/TwoFactor'
import SignInFortyTwo from './Account/SignInFortyTwo'

import Home from './Home/Home'
import Play from './Play/Play'
import { MatchMakingRoom, PreMatchRoom, ResultRoom } from './Play/GameRooms'
import Spectate from './Play/Spectate'
import Chat from './Chat/Chat'
import Profile from './Profile/Profile'

import '../static/App.scss'


function App() {
  const [cookies] = useCookies(['auth']);
  const [socket, setSocket] = useState<Socket>();

  function WrappedComponent( props: {component: any}) {
    return (
      <Main component={props.component} socket={socket as Socket}/>
    )
  } 

  const routes = [
    {
      path: '/',
      component: <Login socketSetter={setSocket}/>
    }, {
      path: '/signin',
      component: <SignIn />
    }, {
      path: '/signinFortyTwo',
      component: <SignInFortyTwo />
    }, {
      path: '/home',
      component: <WrappedComponent component={<Home />}/>
    }, {
      path:'/spectate',
      component: <WrappedComponent component={<Spectate />}/>
    }, {
      path:'/chat',
      component: <WrappedComponent component={<Chat socket={socket as Socket}/>}/>
    }, {
      path:'/waitingroom',
      component: <WrappedComponent component={<MatchMakingRoom socket={socket as Socket}/>}/>
    }, {
      path:'/game',
      component: <WrappedComponent component={<Play />}/>
    }, {
      path:'/game/:gid',
      component: <WrappedComponent component={<PreMatchRoom socket={socket as Socket}/>}/>
    }, {
      path:'/results/:gid',
      component: <WrappedComponent component={<ResultRoom />}/>
    }, {
      path:'/profile',
      component: <WrappedComponent component={<Profile />}/>
    }, {
      path:'/profile/:uid',
      component: <WrappedComponent component={<Profile />}/>
    }, {
      path:'/twoFactor',
      component: <TwoFactor socket={socket as Socket}/>
    }, {
      path:'/*',
      component: <NotFound />
    },
  ]

  useEffect( () => {
    document.title='Transcendance'
    return (() => {socket?.close()})
  }, [])

  useEffect(() => {
    if (!socket && cookies['auth']) {
      const newSocket = io("http://" + process.env.REACT_APP_SERVER_IP, {
        withCredentials: true,
        query: { auth: cookies["auth"] },
      });
      setSocket(newSocket);
    }
  })


	return (
	<div className="App">
		<BrowserRouter>
		<Header/>
		<Routes>
      {
        routes.map((route: {path: string, component: ReactNode}, idx: number) => {
          return (<Route
            key={idx}
            path={route.path}
            element={route.component}
          />
          )
        })
      }
		</Routes>
		</BrowserRouter>
	</div>
	)
}
export default App;
