import { useState } from 'react';

function Options(props: {username: string}) {
  const [newNickname, setNewNickname] = useState('');
  const [newImage, setNewImage] = useState<File>();

	return (
    <div className="Options">
      <div class="ChangeValue">
        <p>Nickname:</p>
        <input
          type="text"
          onChange={(event)=>setValue(event.target.value)}/>
        <button onClick={()=>console.log(newNickname)}>change</button>
      </div>
      <div class="ChangeValue">
        <p>Image:</p>
        <input
          type="file"
          onChange={(event)=>setNewImage(event.target.value)}/>
        <button onClick={()=>console.log(newImage)}>change</button>
      </div>
    </div>
  )
}

export default Options;
