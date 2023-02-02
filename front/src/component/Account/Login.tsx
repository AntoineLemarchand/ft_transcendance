import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { io } from "socket.io-client";

import "static/Account/Prompt.scss";

import { ReactComponent as SchoolLogo } from "static/logo.svg";

function Login(props: {socketSetter: Function}) {
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["auth", "userInfo"]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (cookie["auth"] !== undefined) navigate("/home");
  });

  const initSocket = (token: string) => {
      const newSocket = io("http://" + process.env.REACT_APP_SERVER_IP, {
        withCredentials: true,
        query: { auth: token },
      });
      props.socketSetter(newSocket);
  }

  const ProcessLogin = () => {
    fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/auth/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    }).then(async (response) => {
      if (response.status === 201) {
        const token = await response.text().then((body) => {
          return JSON.parse(body).access_token;
        });
        setCookie("auth", token, { path: "/", sameSite: 'strict' });
        initSocket(token);
        setCookie("userInfo", "", { path: "/", sameSite: 'strict' });
        fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/user/info", {
          credentials: "include",
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }).then((result) => {
          result.text().then((text) => {
            let cookie = JSON.parse(text).userInfo;
            cookie.image = [];
            setCookie("userInfo", cookie, { path: "/", sameSite: 'strict' });
          });
        });
        navigate("/home");
      } else {
        alert("Wrong credentials");
      }
    });
  };

  const UpdatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const UpdateLogin = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <div className="Prompt">
      <input type="text" onChange={UpdateLogin} placeholder="Login" />
      <input type="password" onChange={UpdatePassword} placeholder="Password" />
      <div className="buttonBox">
        <button className="login" onClick={ProcessLogin}>
          Login
        </button>
        <button className="signin" onClick={() => navigate("/signin")}>
          Sign in
        </button>
        <a href={
            'https://api.intra.42.fr/oauth/authorize?' +
            'client_id=' + process.env.REACT_APP_FORTYTWO_CLIENT_ID +
            '&redirect_uri=http://' + process.env.REACT_APP_SERVER_IP + '/api/auth/oauth/callback'  +
            '&response_type=code'
        }>
        <button className="Oauth">
          <SchoolLogo />
        </button>
        </a>
      </div>
    </div>
  );
}

export default Login;
