import React from "react";
import { Card, Container } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";

import AccountInfo from "../components/AccountInfo";


const requireContext = require.context("../pics", true, /^\.\/.*\.png$/);
const testImages = requireContext.keys().map(requireContext);

class Purchase extends React.Component{
  
  constructor(props) {
    super(props)
    this.state = {
      image:''
    }
  }

  componentDidMount = () => {
    const idx = Math.floor(Math.random() * 43)
    const img = testImages[idx]
    console.log(idx)
    const image = {
      image: img,
      title: "there is no title",
      author: "0x0000000000000000000000000000000000000000000000000000000000000001"
    }
    this.setState({image: image })
    // console.log(this.state.image)
  }

  render() {
    return (
      <Container>
        <main style={{ marginTop: "56px"}}>
          <div className="text-center py-3 ">
            <h2>Purchasing</h2>
            <hr></hr>
          </div>
          <Card className="mb-4">
            <CardHeader > 
            <div className="d-flex justify-content-between ">
              <h5 className="text-truncate align-middle" style={{maxWidth:"50%", marginBottom:"0"}}>{this.state.image.title}</h5>
              <small className="text-truncate align-middle" style={{maxWidth:"30%", marginBottom:"0"}}>Author: {this.state.image.author}</small>
            </div>
            </CardHeader>
            <img className="img-responsive center-block rounded" 
              src= {this.state.image.image }
              alt="No Thumbnail"
              style={{ maxWidth:"100%" }}
            />
          </Card>
        </main>
      </Container>
    )
  }
}

export default Purchase;