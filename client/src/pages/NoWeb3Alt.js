import React from "react";
import { Container } from "react-bootstrap";
import Footer from "../components/Footer";

const mmicon = require( '../metamask.png')

class NoWeb3Alt extends React.Component{

  render() {
    return (
      <Container style={{ paddingTop:"120px", maxWidth:"80%"}}>
        <main className="text-center" >
          {/* <h1 >One more step to Dimage!</h1> */}
          <div className="d-flex align-items-center">
            <h3>Connecting to Ethereum network...</h3>
            <div className="spinner-grow ms-auto" style={{width: "3rem", height:"3rem"}}
              role="status" aria-hidden="true"></div>
          </div>
          <hr></hr>
        </main>
        <div className="row row-cols-2 pt-5 d-flex ">
          <div className="col ">
            <h2>1. &nbsp; </h2>
            <h4>Install MetaMask
              <a href="https://metamask.io/">
              <img src={mmicon} style={{ width:"33px"}}/>
              </a>
            for your browser</h4>
            <p> 
            <a href="https://metamask.io/">download here</a>
            </p>
          </div>
          <div className="col">
            <h2>2. &nbsp; </h2>
            <h4>Connect with your account</h4>
          </div>          
        </div>
        <div className="fixed-bottom"><Footer /></div>
      </Container>
    )
  }
}

export default NoWeb3Alt