import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import "../css/AlertDialog.css";

const useStyles = makeStyles(() => ({
  frame: {
    height: "25%",
    minHeight: "200px",
    width: "40%",
    borderRadius: "25px",
    padding: "5px",
  },
}));

export default function AlertDialog(props) {
  const classes = useStyles();

  const { open, alertTitle, alertDesciption, alertButton } = props;

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.frame }}
      >
        <DialogTitle id="alert-dialog-title">{alertTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {alertDesciption}
          </DialogContentText>
        </DialogContent>
        <DialogActions>{alertButton}</DialogActions>
      </Dialog>
    </div>
  );
}