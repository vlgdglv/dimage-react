import React from 'react'
import { Alert } from 'react-bootstrap';
import PropTypes from "prop-types";

const MyAlert = (props) => {
  
  if (props.show) {
    let header = "Message"
    if (props.type === "danger"){
      header = "Error"
    }else if( props.type === "success"){
      header = "Success"
    }
    return (
      <Alert transition={true}
        style={{ maxWidth:"80%"}} variant={props.type} onClose={props.closeAlert} dismissible>
        <Alert.Heading>{header}</Alert.Heading>
        <p className="text-truncate align-middle">
          { props.message }
        </p>
      </Alert>
    )
  }else{
    return(
      <div></div>
    )
  }
}
// MyAlert.PropTypes = {
//   type: PropTypes.oneOf(['success','danger','warning','info']),
//   show: PropTypes.bool,
//   message: PropTypes.string,
// } 
export default MyAlert;