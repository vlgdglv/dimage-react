import React from "react";

const Footer = (props) => {
  return(
    <footer className="my-3 pt-3 text-muted text-center text-small">
      <p className="mb-1">&copy; vlgd Tech</p>
      <ul className="list-inline">
        <li className="list-inline-item"><a href="#">Get test accounts</a></li>
        <li className="list-inline-item"><a href="#">Bug Report</a></li>
      </ul>
    </footer>
  )
}

export default Footer;