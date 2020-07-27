import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "@material-ui/core/Button";
import FormInfo from "./FormInfo";
import "./SignUp.css";

const useStyles = makeStyles(() => ({
  formFrame: {
    backgroundColor: `rgb(255, 255, 255)`,
    borderRadius: "25px",
    textAlign: "center",
    width: "420px",
    minHeight: "600px",
    boxShadow: `rgba(0, 0, 0, 0.45) 0px 2px 10px`,
  },
  jumpFrame: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "25px",
    textAlign: "center",
    margin: "auto",
    height: "600px",
    overflow: "hidden",
    width: "420px",
  },
  logoFrame: {
    backgroundColor: `rgb(255,0,0)`,
    backgroundSize: "50px auto",
    width: "50px",
    height: "50px",
    borderRadius: "30px",
    margin: "0px auto 0px",
  },
  signUpFrame: {
    height: "48px",
    width: "100%",
    color: "#111",
    borderRadius: "0 0 25px 25px",
  },
  controlCenter: {
    height: "100%",
  },
  signUpText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111",
  },
}));

export default function LoginForm(props) {
  const { onHide, show } = props;
  const classes = useStyles();
  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      // animation={false}
      dialogClassName={classes.jumpFrame}
    >
      <div>
        <div style={{ padding: "20px 10px 24px", height: "552px" }}>
          <div className={classes.logoFrame} />
          <div style={{ height: "10px" }} />
          <div style={{ margin: "0px auto 0px" }}>
            <h style={{ fontSize: "30px", fontWeight: "bold" }}>
              Happy Tree Friend
            </h>
          </div>
          <div style={{ margin: "30px auto 0px" }}>
            <FormInfo />
          </div>
        </div>
        <Button
          variant="contained"
          className={classes.signUpFrame}
          onClick={onHide}
        >
          <div className={classes.signUpText}>Create a new account</div>
        </Button>
      </div>
    </Modal>
  );
}
