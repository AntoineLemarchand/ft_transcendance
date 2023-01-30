import { useState, useEffect } from 'react';

function UserImage(props: {username: string}) {
    const [userImage, setUserImage] = useState('');
    const DefaultImage =
      'https://voiretmanger.fr/wp-content/uploads/2015/07/shrek.jpg'
    useEffect(() => {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/user/image/" +
        props.username, {
        credentials: "include",
        method: "GET",
      }).then(response => {
        response.blob().then( (blob: Blob) => {
          const fileReader = new FileReader();
          fileReader.onload = (event) => {
              setUserImage(event.target!.result as string);
          }
          fileReader.readAsDataURL(blob);
        })
      })
    }, [])

    return (
      <img
        className="userImage"
        src={userImage.startsWith('data:image/') ? userImage : DefaultImage}
        alt={props.username + " avatar"}/>
    )
}

export default UserImage;
