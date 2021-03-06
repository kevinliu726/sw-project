import React, { useState, useEffect } from "react";
import axios from "axios";
import { GridListTileBar, makeStyles } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import { useSelector } from "react-redux";
import { CONCAT_SERVER_URL } from "../../utils";
import Loading from "../../components/Loading";
import { selectUser } from "../../redux/userSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    width: "120px",
    margin: "auto",
    outline: "none",
    borderRadius: "60px",
  },
  central: {
    display: "block",
    margin: "auto",
    width: "70%",
    [theme.breakpoints.down("sm")]: {
      width: "95%",
    },
  },
  rounded: {
    marginTop: "20px",
    width: "120px",
    borderRadius: "60px",
  },
  bar: {
    height: "120px",
    borderRadius: "60px",
  },
  icon: {
    position: "absolute",
    right: "-23px",
    bottom: "-10px",
    color: "#eeeeee",
  },
}));

export default function ProfileAvatar(props) {
  const { name, image, isLoading, setIsAvatarUpload } = props;
  const classes = useStyles();
  const { username, userAvatar } = useSelector(selectUser);
  const [avatarVisibility, setUploadVisibility] = useState(false);
  const changeUploadVisibility = () => setUploadVisibility(!avatarVisibility);
  const handleAvatarUpload = () => {
    setIsAvatarUpload(true);
  };
  const [postUserAvatar, setPostUserAvatar] = useState(null);

  useEffect(() => {
    axios
      .request({
        method: "POST",
        url: CONCAT_SERVER_URL("/api/v1/user/getUserAvatar"),
        data: { name },
      })
      .then((response) => {
        setPostUserAvatar(CONCAT_SERVER_URL(`${response.data}`));
      })
      .finally();
  }, [name]);

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleAvatarUpload();
    }
  };
  if (username === name) {
    return (
      <div
        className={classes.root}
        onMouseEnter={changeUploadVisibility}
        onMouseLeave={changeUploadVisibility}
        role="button"
        tabIndex="0"
        onClick={handleAvatarUpload}
        onKeyUp={handleKeyUp}
      >
        {isLoading ? (
          <div style={{ height: "120px" }}>
            <Loading />
          </div>
        ) : (
          <img
            alt="Avatar"
            className={`${classes.central} ${classes.rounded}`}
            src={userAvatar}
          />
        )}
        {avatarVisibility && (
          <GridListTileBar
            className={classes.bar}
            title={image}
            actionIcon={
              <IconButton
                aria-label={`info about ${image}`}
                className={classes.icon}
                disabled
              >
                <EditIcon />
              </IconButton>
            }
          />
        )}
      </div>
    );
  }
  return (
    <img
      alt="Avatar"
      className={`${classes.central} ${classes.rounded}`}
      src={postUserAvatar}
    />
  );
}
