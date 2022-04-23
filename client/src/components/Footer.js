import React from "react";

const Footer = (props) => {
  return(
    <footer className="my-3 pt-3 text-muted text-center text-small">
      <p className="mb-1">&copy; Company Name</p>
      <ul className="list-inline">
        <li className="list-inline-item"><a href="#">Privacy</a></li>
        <li className="list-inline-item"><a href="#">Terms</a></li>
        <li className="list-inline-item"><a href="#">Support</a></li>
      </ul>
    </footer>
  )
}

export default Footer;