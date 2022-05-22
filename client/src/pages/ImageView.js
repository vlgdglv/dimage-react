import React from "react";
//bootstraps
import { Card, Container } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
//web3
import { web3Context } from '../context/web3Context';

class ImageView extends React.Component{

  static contextType = web3Context;
  constructor(props) {
    super(props)
    this.state = {
      title:'',
      ipfsHash:'',
      account:'',
    }
  }

  componentDidMount = () =>{
    this.setState({
      title:this.props.location.query.title,
      ipfsHash:this.props.location.query.ipfsHash,
      account:this.props.location.query.account
    })
  }

  render() {
    return (
      this.context.account == this.state.account?
      <Container>
        <main style={{ marginTop: "56px"}}>
          <div className="text-center py-3 ">
            <h2>Purchasing</h2>
            <hr></hr>
          </div>
          <Card className="mb-4">
            <CardHeader > 
            <div className="d-flex column">
              <h4 className="text-truncate align-middle" style={{maxWidth:"50%", marginBottom:"0"}}>
                {this.state.title}
                </h4>
            </div>
            </CardHeader>
            <img className="img-responsive center-block rounded" 
              // get original image from ipfs
              src={`https://ipfs.infura.io/ipfs/${this.state.ipfsHash}`}
              alt="No Thumbnail"
              style={{ maxWidth:"100%" }} />
            </Card>
          <hr></hr>
        </main>
      </Container>
      : <h1 className="text-center" style={{ paddingTop:"150px",paddingLeft:"auto" }}>
          No authority!
        </h1>
    )
  }
}

export default ImageView;