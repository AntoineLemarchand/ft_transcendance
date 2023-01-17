import { useNavigate } from "react-router-dom";

import {
  FaLockOpen,
  FaLock,
  FaUserPlus,
  FaUserTimes,
  FaUserSlash,
  FaTableTennis,
  FaEnvelope,
} from "react-icons/fa";

function ProfileBadge(props: {
  mainUser: any;
  shownUser: any;
  inviteButton: any;
}) {
  const twoFa = false;
  const isFriend = false;
  const navigate = useNavigate();

  const AddFriend = () => {
    fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/user/friend", {
      credentials: "include",
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => {
      response.text().then((content) => {
        const method =
          JSON.parse(content).friends.indexOf(props.shownUser.name) > -1
            ? "DELETE"
            : "POST";
        fetch(
          "http://" + process.env.REACT_APP_SERVER_IP + "/api/user/friend",
          {
            credentials: "include",
            method: method,
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              username: props.shownUser.name,
            }),
          }
        );
      });
    });
  };

  const BlockUser = () => {
    fetch(
      "http://" + process.env.REACT_APP_SERVER_IP + "/api/user/blockedUser",
      {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    ).then((response) => {
      response.text().then((content) => {
        const method =
          JSON.parse(content).blockedUsers.indexOf(props.shownUser.name) > -1
            ? "DELETE"
            : "POST";
        fetch(
          "http://" + process.env.REACT_APP_SERVER_IP + "/api/user/blockedUser",
          {
            credentials: "include",
            method: method,
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              username: props.shownUser.name,
            }),
          }
        );
      });
    });
  };

  if (
    props.mainUser === undefined ||
    props.mainUser.name === props.shownUser.name
  ) {
    return (
      <div className="profileBadge">
        <button
          onClick={() => navigate("/TwoFactor")}
          style={{
            background: twoFa ? "#b8bb26" : "#cc241d",
            gridRow: "1/3",
            gridColumn: "1/3",
          }}
        >
          {twoFa ? <FaLock /> : <FaLockOpen />}
        </button>
      </div>
    );
  }

  const CreateRoom = () => {
    fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/game/init/", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        player2: props.shownUser.name,
      }),
    }).then((response) => {
      if (response.status === 201 || response.status === 200) {
        response.text().then((content) => {
          const game = JSON.parse(content);
          navigate("/game/" + game.id);
          console.log("game created");
        });
      }
    });
  };

  return (
    <div className="profileBadge">
      <button
        onClick={AddFriend}
        style={{ background: isFriend ? "#fb4934" : "#b8bb26" }}
      >
        {" "}
        {isFriend ? <FaUserTimes /> : <FaUserPlus />}
      </button>
      <button style={{ background: "#cc241d" }} onClick={BlockUser}>
        <FaUserSlash />
      </button>
      <button style={{ background: "#fe8019" }} onClick={CreateRoom}>
        <FaTableTennis />
      </button>
      <button style={{ background: "#458588" }} onClick={props.inviteButton}>
        <FaEnvelope />
      </button>
    </div>
  );
}

function ProfileHeader(props: {
  mainUser: User;
  shownUser: User;
  inviteMenu: Function;
}) {
  return (
    <header>
      <div className="profileHeader">
        <img
          src="https://voi.img.pmdstatic.net/fit/http.3A.2F.2Fprd2-bone-image.2Es3-website-eu-west-1.2Eamazonaws.2Ecom.2Fvoi.2Fvar.2Fvoi.2Fstorage.2Fimages.2Fmedia.2Fimages.2Fles-potins-du-jour.2Fpotins-26-novembre-2009.2Fshrek.2F5584668-1-fre-FR.2Fshrek.2Ejpg/753x565/cr/wqkgIC8gVm9pY2k%3D/crop-from/top/video-shrek-4-decouvrez-le-premier-teaser.jpg"
          alt="JD"
        />
      </div>
      <h1>{props.shownUser.name}</h1>
      {
        <ProfileBadge
          mainUser={props.mainUser}
          shownUser={props.shownUser}
          inviteButton={props.inviteMenu}
        />
      }
    </header>
  );
}

export default ProfileHeader;
