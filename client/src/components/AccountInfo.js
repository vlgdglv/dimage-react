import React from "react";
import PropTypes from "prop-types";

const AccountInfo = (props) => {
  return(
    <div className="border rounded  my-5" style={{ marginBottom:"auto" }}>  
      <h5 className="my-3 text-center" style={{ color:"#008B45"}}>Account Information</h5>
      <h5 className="mx-3">Address</h5>
      <p className="mx-3 bg-light border rounded text-center text-truncate">{props.account}</p>
      <h5 className="mx-3">Balance</h5>
      <p className="mx-3 bg-light border rounded text-center text-truncate">{props.balance} ETH</p>
  </div>
  )
}

AccountInfo.protoTypes = {
  account: PropTypes.string.isRequired,
  balance: PropTypes.string.isRequired,
}

export default AccountInfo;