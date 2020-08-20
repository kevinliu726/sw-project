import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import { fade, makeStyles } from "@material-ui/core/styles";
import { AppBar, InputBase, Toolbar, Typography } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import { selectUser } from "../redux/userSlice";

import AnnouncementGrid from "./AnnouncementGrid";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  root: {
    zIndex: 1000,
  },
  title: {
    color: "white",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "18ch",
      "&:focus": {
        width: "36ch",
      },
    },
    [`@media screen and (min-width: 600px) and (max-width: 960px)`]: {
      width: "18ch",
      "&:focus": {
        width: "36ch",
      },
    },
  },
  offset: theme.mixins.toolbar,
}));

export default function Bar() {
  const { userId } = useSelector(selectUser);
  const [, page, tag] = window.location.pathname.split("/");

  // Classes & States
  const classes = useStyles();
  const history = useHistory();

  const [adMessage, setAdMessage] = useState("");
  const [isAdOpen, setIsAdOpen] = useState(false);

  const [notesCount, setNotesCount] = useState(0);

  const [searchValue, setSearchValue] = useState(page === "home" ? tag : "");

  // Broadcast
  useEffect(() => {
    if (window.Echo === undefined) return () => {};

    window.Echo.channel("Announcements").listen("Announced", (event) => {
      const { data } = event;
      setIsAdOpen(true);
      setAdMessage({
        id: 0,
        created_at: Date.now(),
        ...data,
      });
      setTimeout(() => {
        setIsAdOpen(false);
      }, 10000);
    });

    return () => {
      window.Echo.channel("Announcements").stopListening("Announced");
      window.Echo.channel("Notifications").stopListening("NotificationChanged");
    };
  }, [userId]);

  // Static contents
  // const chat = [
  //   {
  //     id: 1,
  //     header: "Chat 1",
  //     secondary: "from Andy Chen",
  //     content: "How are you?",
  //   },
  //   {
  //     id: 2,
  //     header: "Chat 2",
  //     secondary: "from Jason Hung",
  //     content: "How do you do?",
  //   },
  // ];

  // Toggle functions

  const handleSearch = (e) => {
    if (e.key === "Enter") history.push(`/home/${e.target.value}`);
  };

  const handleSetSearchValue = (event) => {
    setSearchValue(event.target.value);
  };

  const handleAdClose = () => {
    setIsAdOpen(false);
  };

  // The bar
  return (
    <div className={classes.grow}>
      <AppBar className={classes.root} position="fixed">
        <Toolbar>
          <Link to="/home">
            <Typography className={classes.title} variant="h6" noWrap>
              SW
            </Typography>
          </Link>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onKeyUp={handleSearch}
              onChange={handleSetSearchValue}
              value={searchValue}
            />
          </div>
          <div className={classes.grow} />
          <DesktopMenu notesCount={notesCount} setNotesCount={setNotesCount} />
          <MobileMenu notesCount={notesCount} setNotesCount={setNotesCount} />
        </Toolbar>
      </AppBar>
      {/* New notification */}
      <AnnouncementGrid
        isAdOpen={isAdOpen}
        handleAdClose={handleAdClose}
        adMessage={adMessage}
      />
      <div className={classes.offset} />
    </div>
  );
}
