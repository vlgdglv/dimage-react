import React from "react";
//bootstraps
import { Card, Container } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
//http
import { getImageFromIPFS  } from "../http/image";
//web3
import { web3Context } from '../context/web3Context';

class ImageView extends React.Component{

  static contextType = web3Context;
  constructor(props) {
    super(props)
    this.state = {
      available:false,
      title:'',
      ipfsHash:'',
      account:'',
      imgSrc:'',
      loading:true,
    }
  }

  componentDidMount = () =>{
    if (this.props.location.query == null || 
        this.props.location.query == undefined || 
        this.props.location.query == '') {
      this.setState({available: false})
    }else {
      this.setState({
        available: true,
        title:this.props.location.query.title,
        ipfsHash:this.props.location.query.ipfsHash,
        account:this.props.location.query.account,
      })
      // this.loadImage(this.props.location.query.ipfsHash)
    }
  }

  loaded = (event) => {
    this.setState({loading: false})
  }

  render() {
    return (
      this.state.available?
      this.context.account == this.state.account?
      <Container>
        <main style={{ marginTop: "56px"}}>
          <div className="text-center py-3 ">
            <h2>Original Image</h2>
            <hr></hr>
          </div>
          <Card className="mb-4">
            <CardHeader > 
            <div className="d-flex column">
              <h4 className="text-truncate align-middle" style={{maxWidth:"50%", marginBottom:"0"}}>
                {this.state.title}
                </h4>
              {
                this.state.loading?
                <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
                :<div></div>
              }
            </div>
            </CardHeader>
            <img className="img-responsive center-block rounded" 
              // get original image from ipfs
              src={`https://ipfs.infura.io/ipfs/${this.state.ipfsHash}`}
              alt="No Thumbnail"
              style={{ maxWidth:"100%" }}
              onLoad={this.loaded}/>

            
            </Card>
          <hr></hr>
        </main>
      </Container>
      : <h1 className="text-center" style={{ paddingTop:"150px",paddingLeft:"auto" }}>
          No authority!
        </h1>    
      : <h1 className="text-center" style={{ paddingTop:"150px",paddingLeft:"auto" }}>
          For safety reasons, please go back to detail pages.
        </h1>    
  
    )
  }
}

export default ImageView;