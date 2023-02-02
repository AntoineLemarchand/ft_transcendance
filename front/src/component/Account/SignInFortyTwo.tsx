import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";

import 'static/Account/Prompt.scss'

import { ReactComponent as SchoolLogo } from "static/logo.svg";

function SignInFortyTwo() {
  const [cookies, setCookie] = useCookies(['fortytwo_token']);

	const navigate = useNavigate();
  const [username, setUsername] = useState('')
  // const [password, setPassword] = useState('')
  // const [confirmation, setConfirmation] = useState('')
  const [selectedImage, setSelectedImage] = useState<File>()

  const UpdateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const UpdateImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  }

	const ProcessSignIn = () => {
  if (username === '') {
    alert('Please provide a username');
    return;
  } else if (selectedImage !== undefined && !selectedImage.type.includes('image')) {
    alert('Please upload an image file');
    return;
  }

  let body = new FormData();
  body.append('username', username);
  body.append('accessToken', cookies['fortytwo_token']);
  if (selectedImage)
    body.append('image', selectedImage);


  fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/auth/signin', {
    method: 'POST',
    body: body,
  })
  .then(async (response) => {
    if (response.status === 201) {
        const token = await response.text().then((body) => {
          return JSON.parse(body).access_token;
        });
        setCookie("auth", token, { path: "/", sameSite: 'strict' });
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
        alert('Username already taken');
      }
    });
}

	return (
		<div className="Prompt">
			<input type="text" placeholder="Username"
        onChange={UpdateUsername}/>
      <div className="avatar">
        <img src={selectedImage !== undefined ? URL.createObjectURL(selectedImage) : ''} alt="Avatar: " />
        <input type="file" accept="image/*"
          onChange={UpdateImage}
        />
      </div>
      <div className="buttonBox">
        <button className="Oauth" onClick={ProcessSignIn}>
          <SchoolLogo />
        </button>
      </div>
		</div>
	)
}

export default SignInFortyTwo;
