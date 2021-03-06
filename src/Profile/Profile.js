import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { makeStyles } from "@material-ui/core";
import { addHours, compareAsc } from "date-fns";
import Loading from "../components/Loading";
import Errormsg from "../components/ErrorMsg";
import ErrorGrid from "../components/ErrorGrid";
import PhotoGrid from "../components/PhotoGrid";
import { CONCAT_SERVER_URL } from "../utils";
import { selectUser, setAvatar } from "../redux/userSlice";
import CustomModal from "../components/CustomModal";
import AvatarUpload from "./AvatarUpload";
import "./css/Profile.css";
import FollowButton from "./upload_follow/FollowButton";
import ChatButton from "./upload_follow/ChatButton";
import UploadButton from "./upload_follow/UploadButton";
import ProfileAvatar from "./userInfo/ProfileAvatar";
import ProfileInformation from "./userInfo/ProfileInformation";

const useStyles = makeStyles((theme) => ({
  jumpFrame: {
    height: "400px",
    width: "400px",
    borderRadius: "30px",
    [theme.breakpoints.down("sm")]: {
      width: "95%",
    },
  },
  central: {
    display: "block",
    margin: "auto",
    width: "70%",
    [theme.breakpoints.down("sm")]: {
      width: "95%",
    },
  },
  center: {
    textAlign: "center",
  },
  rounded: {
    marginTop: "20px",
    width: "120px",
    borderRadius: "60px",
  },
  bold: {
    color: "#111",
    fontWeight: "700",
  },
  name: {
    marginTop: "10px",
    fontSize: "36px",
  },
  text: {
    lineHeight: "25px",
    fontSize: "16px",
  },
  url: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
      cursor: "pointer",
    },
  },
  input: {
    display: "none",
  },
  paper: {
    padding: "10px",
    paddingTop: "50px",
    paddingBottom: "50px",
    marginTop: "100px",
  },
  follow_chat: {
    display: "inline-flex",
    marginLeft: "calc(50% - 60px)",
  },
}));

function checkBucket(bucketTime) {
  if (bucketTime) {
    const bucketDate = addHours(new Date(bucketTime), 8);
    const now = new Date();
    if (compareAsc(bucketDate, now) === 1) {
      return true;
    }
  }
  return false;
}

export default function Profile(props) {
  const {
    match: {
      params: { name },
    },
  } = props;

  const classes = useStyles();

  const [image, setImage] = useState("");
  const dispatch = useDispatch();
  const stableDispatch = useCallback(dispatch, []);
  const [isUpload, setIsUpload] = useState(false);
  const [readyStates, setReadyStates] = useState("Loading");
  const [isAvatarUpload, setIsAvatarUpload] = useState(false);
  const [id, setId] = useState(0);
  const { username, bucketTime } = useSelector(selectUser);
  const [follow, setFollow] = useState({ followers: 0, followings: 0 });
  const isBucket = checkBucket(bucketTime);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `${name}のホームページ`;
  });

  useEffect(() => {
    if (name === username) {
      setIsLoading(true);
      axios
        .request({
          method: "POST",
          url: CONCAT_SERVER_URL("/api/v1/user/getUserAvatar"),
          data: { name },
        })
        .then((response) => {
          stableDispatch(
            setAvatar({ userAvatar: CONCAT_SERVER_URL(`${response.data}`) })
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [name, username, isUpload, stableDispatch]);

  async function refreshInfo() {
    const jsonData = { name };
    const res = await axios.request({
      method: "POST",
      url: CONCAT_SERVER_URL("/api/v1/user/userExist"),
      data: jsonData,
    });
    const userExist = res.data.isValid;
    // Not existed user
    if (userExist === false) {
      setReadyStates("NoUser");
      return;
    }
    setId(res.data.id);
    axios
      .get(CONCAT_SERVER_URL("/api/v1/follows/info"), {
        params: { user_id: res.data.id },
      })
      .then(({ data }) => {
        setFollow({ followers: data.followers, followings: data.followings });
      });
    setReadyStates("OK");
  }

  function refreshFollow() {
    axios
      .get(CONCAT_SERVER_URL("/api/v1/follows/info"), {
        params: { user_id: id },
      })
      .then(({ data }) => {
        setFollow({ followers: data.followers, followings: data.followings });
      })
      .catch(() => setReadyStates("Error"));
  }

  useEffect(() => {
    setReadyStates("Loading");
    refreshInfo().catch(() => setReadyStates("Error"));
  }, [username, name]);

  const uploadButton = isBucket ? (
    <div className={classes.center}>In Bucket</div>
  ) : (
    <UploadButton image={image} setImage={setImage} />
  );

  const onHide = () => {
    setIsAvatarUpload(false);
  };

  if (readyStates === "OK") {
    return (
      <div>
        <ProfileAvatar
          name={name}
          image={image}
          isLoading={isLoading}
          setIsAvatarUpload={setIsAvatarUpload}
        />
        <ProfileInformation name={name} follow={follow} />
        {username !== null &&
          (username === name ? (
            uploadButton
          ) : (
            <div className={classes.follow_chat}>
              <FollowButton id={id} setRefresh={refreshFollow} />
              <ChatButton id={id} name={name} />
            </div>
          ))}
        <div className={classes.central}>
          <PhotoGrid userId={id} />
        </div>

        <CustomModal
          show={isAvatarUpload}
          onHide={onHide}
          jumpFrame={classes.jumpFrame}
          backdrop
        >
          <AvatarUpload
            setIsLoading={setIsLoading}
            name={name}
            setIsUpload={() => {
              setIsUpload((preState) => !preState);
            }}
            onHide={onHide}
          />
        </CustomModal>
      </div>
    );
  }
  if (readyStates === "NoUser") {
    return <ErrorGrid mes="user" />;
  }
  if (readyStates === "Error") {
    return <Errormsg />;
  }
  return <Loading />;
}
