import { useState } from 'react';
import 'static/Profile/Options.scss';

function Options() {
  const [newNickname, setNewNickname] = useState('');
  const [newImage, setNewImage] = useState<File>();

  const updateImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewImage(event.target.files[0]);
    }
  }

  const processNickname = () => {
    console.log(newNickname);
  }

  const processImage = () => {
    if (newImage !== undefined && !newImage.type.includes('image')) {
      alert('Please upload an image file');
      return;
    }
    if (newImage) {
      let body = new FormData();
      body.append('image', newImage);
      fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/user/image', {
        method: 'POST',
        body: body,
      })
      .then(response => {
        if (response.status === 201) {
          alert('Image has been changed');
        } else {
          alert('Could not change image');
        }
      })
    }
  }

	return (
    <div className="Options">
      <div className="ChangeValue">
        <p>Nickname:</p>
        <input
          type="text"
          onChange={(event)=>setNewNickname(event.target.value)}/>
        <button onClick={processNickname}>change</button>
      </div>
      <div className="ChangeValue">
        <p>Image:</p>
        <input
          type="file"
          accept="image/*"
          onChange={updateImage}/>
        <button onClick={processImage}>change</button>
      </div>
    </div>
  )
}

export default Options;
