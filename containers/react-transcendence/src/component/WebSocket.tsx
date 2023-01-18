import { createContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import { useCookies } from 'react-cookie'

/*
function useAuthCookie() {
  const [cookies, setCookie] = useCookies(['auth']);

  // Vérifie si le cookie auth existe
  if (!cookies.auth) {
    // Créer un nouveau cookie auth
    setCookie('auth', 'your_auth_token', { path: '/' });
  }

  return cookies.auth;
}

const InitSocket = () => {
  const auth = useAuthCookie();
  const [socket, setSocket] = useState<Socket | undefined>();

  useEffect(() => {
    if (auth) {
      setSocket(io('http://' + process.env.REACT_APP_SERVER_IP, {
        withCredentials: true,
        query: { auth }
      }));
    }
  }, [auth]);

  return socket;
}

const socket = InitSocket();
*/

let auth: string | undefined;
let socket: Socket | undefined;

export const SocketContext = createContext({auth: auth, socket: socket});

export const SocketProvider = (props: {children: React.ReactNode}) => {
  return (
    <SocketContext.Provider value={{auth: auth, socket: socket}}>
      {props.children}
    </SocketContext.Provider>
  );
};
