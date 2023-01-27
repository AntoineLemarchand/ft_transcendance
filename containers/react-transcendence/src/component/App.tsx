import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Socket, io } from 'socket.io-client';

import Main from './Main'
import NotFound from './NotFound'
import Header from './Header'
import Login from './Account/Login'
import SignIn from './Account/SignIn'

import Home from './Home/Home'
import Play from './Play/Play'
import { MatchMakingRoom, PreMatchRoom } from './Play/WaitingRooms'
import Spectate from './Play/Spectate'
import Chat from './Chat/Chat'
import Profile from './Profile/Profile'

import '../static/App.scss'

function App() {
  const [cookies] = useCookies(['auth', 'userInfo']);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const routes = [
    {
      path: '/',
      component: <Login />
    }, {
      path: '/signin',
      component: <SignIn />
    }, {
      path: '/home',
      component: <Main component={<Home />}/>
    }, {
      path:'/spectate',
      component: <Main component={<Spectate />}/>
    }, {
      path:'/chat',
      component: <Main component={<Chat />}/>
    }, {
      path:'/waitingroom',
      component: <Main component={<MatchMakingRoom />}/>
    }, {
      path:'/game',
      component: <Main component={<Play />}/>
    }, {
      path:'/game/:gid',
      component: socket && <Main component={<PreMatchRoom socket={socket}/>}/>
    }, {
      path:'/profile',
      component: <Main component={<Profile user={cookies['userInfo']}/>}/>
    }, {
      path:'/profile/:uid',
      component: <Main component={<Profile user={cookies['userInfo']}/>}/>
    }, {
      path:'/*',
      component: <NotFound />
    },
  ]

  useEffect(()=> {
    document.title='Transcendance'
    return (() => socket?.close())
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
        routes.map((route: {path: string, component: JSX.Element}, idx: number) => {
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
