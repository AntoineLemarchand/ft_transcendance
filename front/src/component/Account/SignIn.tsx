import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import 'static/Account/Prompt.scss'

function SignIn() {
	const navigate = useNavigate();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [selectedImage, setSelectedImage] = useState<File>()

  const UpdateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const UpdatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const UpdateConfirmation = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmation(event.target.value)
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
  } else if (password !== confirmation) {
    alert('Passwords do not match');
    return;
  } else if (selectedImage !== undefined && !selectedImage.type.includes('image')) {
    alert('Please upload an image file');
    return;
  }

  let body = new FormData();
  body.append('username', username);
  body.append('password', password);
  if (selectedImage)
    body.append('image', selectedImage)

  fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/auth/signin', {
    method: 'POST',
    body: body,
  })
  .then(response => {
    if (response.status === 201) {
      navigate('/');
    } else {
      alert('Username already taken');
    }
  })
}

	return (
		<div className="Prompt">
			<input type="text" placeholder="Username"
        onChange={UpdateUsername}/>
			<input type="password" placeholder="Password"
        onChange={UpdatePassword}/>
			<input type="password" placeholder="Confirm Password"
        onChange={UpdateConfirmation}/>
      <div className="avatar">
        <img src={selectedImage !== undefined ? URL.createObjectURL(selectedImage) : ''} alt="Avatar: " />
        <input type="file" accept="image/*"
          onChange={UpdateImage}
        />
      </div>
      <div className="buttonBox">
        <button className="signin" onClick={ProcessSignIn}>Sign in</button>
      </div>
		</div>
	)
}

export default SignIn;
