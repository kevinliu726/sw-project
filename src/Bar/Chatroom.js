import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "react-query";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import axios from "axios";

import clsx from "clsx";
import {
  Button,
  Divider,
  TextareaAutosize,
  Typography,
  Paper,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import ScrollToBottom, {
  useScrollToBottom,
  useObserveScrollPosition,
} from "react-scroll-to-bottom";
import { selectUser } from "../redux/userSlice";

import Loading from "../components/Loading";
import ChatBox from "./ChatBox";
import { CONCAT_SERVER_URL } from "../utils";
import AlertDialog from "../components/AlertDialog";
import useIntersectionObserver from "../components/useIntersectionObserver";

const useStyles = makeStyles(() => ({
  root: {
    height: "80vh",
    display: "flex",
  },
  room: {
    border: "5px solid #9fbfdf",
    borderRadius: "10px",
    padding: "10px",
    height: "90%",
    width: "90%",
    display: "flex",
    flexFlow: "column",
    margin: "auto",
  },
  avatar: {
    width: "35px",
    height: "35px",
    margin: "10px",
    padding: "1px",
    border: "2px solid #3f51b5",
    borderRadius: "25px",
  },
  chatroomStyle: {
    display: "inline",
    marginLeft: "10px",
    fontSize: "26px",
    color: "black",
  },
  messages: {
    overflow: "auto",
    flex: "auto",
    "& button": {
      background: "url('/pictures/icon-to-down.jpg')",
      backgroundSize: "20px",
      outline: "none",
    },
    "& > div": {
      display: "flex",
      flexFlow: "column-reverse",
    },
  },
  hideButton: {
    "& button": {
      display: "none",
    },
  },
  input: {
    resize: "none",
    width: "100%",
    borderRadius: "5px",
    fontSize: "20px",
    alignItems: "center",
    padding: "3px 0.5em 0 0.5em",
    minHeight: "36px",
    lineHeight: "25px",
    "&:focus": {
      outline: 0,
    },
  },
  sendBox: {
    display: "flex",
    margin: "15px",
    alignItems: "flex-end",
  },
  button: {
    height: 36,
    borderRadius: 5,
    marginLeft: 5,
  },
  end: {
    textAlign: "center",
    padding: "5px",
  },
  endText: {
    color: "#666",
  },
  newMessage: {
    position: "absolute",
    width: "100%",
    height: "35px",
    background: "#fff8e5",
    padding: "5px 60px 5px 5px",
    textAlign: "left",
    overflow: "hidden",
  },
}));

function ScrollController(props) {
  const classes = useStyles();
  const { children, data, name, setIsHide } = props;
  const { userId } = useSelector(selectUser);

  const [isNew, setIsNew] = useState(false);

  const [position, setPosition] = useState(1);
  const scrollToBottom = useScrollToBottom();
  const observe = (pos) => setPosition(pos.scrollTop);
  useObserveScrollPosition(observe);

  useEffect(() => {
    if (data[0].message[0] !== undefined) {
      if (position >= -40) scrollToBottom({ behavior: "smooth" });
      else if (data[0].message[0].from === userId)
        scrollToBottom({ behavior: "smooth" });
      else setIsNew(true);
    }
  }, [data[0].message[0]]);

  useEffect(() => {
    if (position <= -110) setIsHide(false);
    else {
      setIsHide(true);
      setIsNew(false);
    }
  }, [position <= -110]);

  return (
    <>
      {isNew && (
        <Paper className={classes.newMessage}>
          {name} : {data[0].message[0].message}
        </Paper>
      )}
      {children}
    </>
  );
}

export default function Chatroom(props) {
  const classes = useStyles();
  const { chatInfo, setChatInfo, onHide } = props;
  const { userId } = useSelector(selectUser);

  // For infinite scroll
  const boxesMore = useRef();
  const [isReady, setIsReady] = useState(false);
  const [show, setShow] = useState(true);
  const [isHide, setIsHide] = useState(true);

  // For new message
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [isConnectionFailed, setIsConnectionFailed] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  // Update
  const handleSetValue = (event) => {
    setValue(event.target.value);
  };

  const handleRead = () => {
    axios.post(CONCAT_SERVER_URL("/api/v1/chatroom/read"), {
      user_id1: userId,
      user_id2: chatInfo.id,
    });

    axios.post(CONCAT_SERVER_URL("/api/v1/broadcast/chatread"), {
      room_id: chatInfo.roomId,
      from: userId,
    });
  };

  const handleRefresh = () => {
    const jsonData = {
      room_id: chatInfo.roomId,
      last_message: value,
      from: userId,
    };

    axios
      .request({
        method: "POST",
        url: CONCAT_SERVER_URL("/api/v1/broadcast/chatting"),
        data: jsonData,
      })
      .catch(() => {
        setErrMessage({
          title: "Network error",
          message: "Failed to send the message, please retry",
        });
        setIsConnectionFailed(true);
      })
      .finally(() => {
        setValue("");
        setIsSending(false);
      });
  };

  const handleSendBox = () => {
    if (value === "") return;
    axios
      .post(CONCAT_SERVER_URL("/api/v1/chatbox"), {
        room_id: chatInfo.roomId,
        from: userId,
        to: chatInfo.id,
        last_message: value,
      })
      .then(() => handleRefresh())
      .catch(() => {
        setErrMessage({
          title: "Network error",
          message: "Failed to send the message, please retry",
        });
        setIsConnectionFailed(true);
      });
  };

  const handleSendRoom = () => {
    if (value === "") return;

    setIsSending(true);
    axios
      .post(CONCAT_SERVER_URL("/api/v1/chatroom"), {
        user_id1: userId,
        user_id2: chatInfo.id,
        last_message: value,
      })
      .then((res) => {
        if (chatInfo.roomId === 0) {
          // New chatroom
          setChatInfo((state) => ({
            ...state,
            roomId: res.data.room_id,
          }));
        } else {
          handleSendBox();
        }
      })
      .catch(() => {
        setErrMessage({
          title: "Network error",
          message: "Failed to send the message, please retry",
        });
        setIsConnectionFailed(true);
        setIsSending(false);
      });
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey && /^\s+$/.test(value) === false)
      handleSendRoom();
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (/^\s+$/.test(value) === false) handleSendRoom();
  };

  // Infinite scroll
  const {
    status,
    data: boxes,
    isFetching,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    refetch,
  } = useInfiniteQuery(
    "boxes",
    async (_, start = 0) => {
      if (chatInfo.roomId === 0) return { message: [] };
      const jsonData = {
        room_id: chatInfo.roomId,
        start,
        number: 20,
      };
      const res = await axios.request({
        method: "GET",
        url: CONCAT_SERVER_URL("/api/v1/chatbox"),
        params: jsonData,
      });
      return res.data;
    },
    {
      getFetchMore: (lastGroup) => lastGroup.start,
    }
  );

  useIntersectionObserver({
    target: boxesMore,
    onIntersect: fetchMore,
    enabled: canFetchMore,
  });

  useEffect(() => {
    if (status === "success") {
      setIsReady(true);
      setTimeout(() => setShow(false), 1);
      setTimeout(() => setShow(true), 2);
    }
  }, [status]);

  useEffect(() => {
    if (window.Echo === undefined) return () => {};
    if (chatInfo.roomId === 0) return () => {};
    handleSendBox(); // When create a new chatroom

    // Check read by the other side
    axios
      .get(CONCAT_SERVER_URL("/api/v1/chatroom/getInfoByUser"), {
        params: { user_id1: userId, user_id2: chatInfo.id },
      })
      .then((res) => {
        setChatInfo((state) => ({
          ...state,
          last_read: res.data.last_read,
          unread: res.data.unread,
          newest: res.data.newest,
        }));
      })
      .finally(
        () => handleRead() // Tell the other side read
      );

    window.Echo.private(`Chatroom.${chatInfo.roomId}`)
      .listen("ChatSent", (event) => {
        refetch(); // New message
        const { from } = event;
        if (from !== userId) handleRead(); // Tell the other side read
      })
      .listen("ChatRead", (event) => {
        const { from, lastRead } = event;
        if (from === userId) return;
        // Read by the other side
        setChatInfo((state) => ({
          ...state,
          last_read: lastRead,
        }));
      });

    return () => {
      window.Echo.channel(`Chatroom.${chatInfo.roomId}`)
        .stopListening("ChatSent")
        .stopListening("ChatRead");
      handleRead(); // Refresh read status
      refetch(); // Clear previous chatroom
    };
  }, [chatInfo.roomId, refetch]);

  if (isReady) {
    return (
      <div className={classes.root}>
        <div className={classes.room}>
          <Typography variant="h5" style={{ margin: "5px auto" }} gutterBottom>
            <Link to={`/profile/${chatInfo.name}`} onClick={onHide}>
              <img
                alt="Avatar"
                className={classes.avatar}
                src={CONCAT_SERVER_URL(chatInfo.avatar_url)}
              />
              <p className={classes.chatroomStyle}>{chatInfo.name}</p>
            </Link>
          </Typography>

          <Divider />

          <ScrollToBottom
            className={clsx(classes.messages, { [classes.hideButton]: isHide })}
          >
            <ScrollController
              data={boxes}
              name={chatInfo.name}
              setIsHide={setIsHide}
            >
              {boxes.map((page) =>
                page.message.map((text) => (
                  <ChatBox
                    key={text.id}
                    id={text.id}
                    chatInfo={chatInfo}
                    message={text.message}
                    from={text.from}
                    time={text.created_at}
                    firstOfDate={text.firstOfDate}
                  />
                ))
              )}
              {show && (
                <div ref={boxesMore} className={classes.end}>
                  {isFetching || isFetchingMore ? (
                    <Loading />
                  ) : (
                    !canFetchMore && (
                      <Typography
                        variant="button"
                        className={classes.endText}
                        gutterBottom
                      >
                        No message left
                      </Typography>
                    )
                  )}
                </div>
              )}
            </ScrollController>
          </ScrollToBottom>

          <Divider />

          <form className={classes.sendBox}>
            <TextareaAutosize
              id="standard-basic"
              className={classes.input}
              rowsMin={1}
              rowsMax={5}
              value={value}
              onChange={handleSetValue}
              onKeyDown={handleEnter}
            />
            {isSending ? (
              <div className={classes.button}>
                <Loading />
              </div>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOnSubmit}
                component="span"
                className={classes.button}
              >
                <SendIcon />
              </Button>
            )}
          </form>
        </div>
        <AlertDialog
          open={isConnectionFailed}
          alertTitle={errMessage.title}
          alertDesciption={errMessage.message}
          alertButton={
            <Button
              onClick={() => {
                setIsConnectionFailed(false);
              }}
            >
              Got it!
            </Button>
          }
          onClose={() => {
            setIsConnectionFailed(false);
          }}
        />
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <Loading />
    </div>
  );
}
