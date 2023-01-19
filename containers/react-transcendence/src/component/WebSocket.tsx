import { createContext, useState } from "react";
import { io, Socket } from 'socket.io-client';

const initialAuth: string | undefined = undefined
const initialSocket: Socket | undefined = undefined

interface ContextProps {
  auth: string | undefined;
  setAuth: React.Dispatch<React.SetStateAction<string | undefined>>;
  socket: Socket | undefined;
  initSocket: Function;
}

export const SocketContext = createContext<ContextProps>(
{
  auth: '',
  setAuth: () => {},
  socket: undefined,
  initSocket: () => {},
});

export const SocketProvider = (props: {children: React.ReactNode}) => {
  const [auth, setAuth] = useState(initialAuth);
  const [socket, setSocket] = useState(initialSocket);

  const initSocket = () => {
    if (auth) {
      const newSocket = io('http://' + process.env.REACT_APP_SERVER_IP, {
          withCredentials: true,
          query: {auth: auth},
        })
      setSocket(newSocket);
    }
  }

  return (
    <SocketContext.Provider
      value={{auth, setAuth, socket, initSocket}}>
      {props.children}
    </SocketContext.Provider>
  );
};
