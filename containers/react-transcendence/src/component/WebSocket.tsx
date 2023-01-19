import { createContext, useState } from "react";
import { Socket } from 'socket.io-client';

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

const initialAuth: string | undefined = undefined
const initialSocket: Socket | undefined = undefined

interface ContextProps {
  auth: string | undefined;
  setAuth: React.Dispatch<React.SetStateAction<string | undefined>>;
  socket: Socket | undefined;
  setSocket: React.Dispatch<React.SetStateAction<Socket | undefined>>;
}

export const SocketContext = createContext<ContextProps>(
{
  auth: '',
  setAuth: () => {},
  socket: undefined,
  setSocket: () => {}
});

export const SocketProvider = (props: {children: React.ReactNode}) => {
  const [auth, setAuth] = useState(initialAuth);
  const [socket, setSocket] = useState(initialSocket);

  return (
    <SocketContext.Provider
      value={{auth, setAuth, socket, setSocket}}>
      {props.children}
    </SocketContext.Provider>
  );
};
