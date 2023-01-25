import { useState } from "react";
import { io, Socket } from "socket.io-client";

const initialAuth: string | undefined = undefined;
const initialSocket: Socket | undefined = undefined;
const initialUserInfo: {} | undefined = undefined;

export const useAuth = () => {
  const [auth, setAuth] = useState(initialAuth);
  return { auth, setAuth };
};

export const useSocket = () => {
  const [socket, setSocket] = useState(initialSocket);
  const initSocket = (auth: string | undefined) => {
    if (auth) {
      const newSocket = io("http://" + process.env.REACT_APP_SERVER_IP, {
        withCredentials: true,
        query: { auth: auth },
      });
      setSocket(newSocket);
    }
  };
  return { socket, initSocket };
};

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(initialUserInfo);
  return { userInfo, setUserInfo };
};
