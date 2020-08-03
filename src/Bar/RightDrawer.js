import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
// import SettingsIcon from "@material-ui/icons/Settings";
import { Link } from "react-router-dom";
import { deleteCookie } from "../cookieHelper";

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
});

export default function RightDrawer(props) {
  const classes = useStyles();

  const { open, toggleDrawer, button, username } = props;
  const logOut = () => {
    deleteCookie();
  };

  // Settings hasn't implemented.
  const menuList = [
    {
      label: "My account",
      icon: <AccountCircleIcon />,
      link: `/profile/${username}`,
      event: null,
    },
    /*
    {
      label: "Setting",
      icon: <SettingsIcon />,
      link: "/setting",
      event: null,
    },
    */
    {
      label: "Log out",
      icon: <ExitToAppIcon />,
      link: "/",
      event: logOut,
    },
  ];

  const menu = menuList.map((page) => (
    <Link to={page.link} key={page.label} onClick={page.event}>
      <ListItem button>
        <ListItemIcon>{page.icon}</ListItemIcon>
        <ListItemText primary={page.label} />
      </ListItem>
    </Link>
  ));

  const list = () => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>{menu}</List>
    </div>
  );

  return (
    <div>
      {button}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </div>
  );
}
