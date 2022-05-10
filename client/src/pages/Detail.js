import React from "react";
import { Container,Card, } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";

import { getImageByID, getThumbnail } from "../http/image";
import { getLatestTx } from "../http/purchase";
import Footer from "../components/Footer";
import { web3Context } from '../context/web3Context';
require('bootstrap')
const moment = require('moment')
// const Detail = () => <h1 style={{ paddingTop:"150px" }}>Image Detail</h1>;

class Detail extends React.Component{
  
  static contextType = web3Context;
  constructor(props){
    super(props)
    this.state={
      image:'',
      loading: false,
      latestTx:'',
      isMe:false,
      account:'',
    }
  }

  componentDidMount = () => {
    let id = this.props.location.id
    // id = 1
    const account = this.context.account
    this.setState({account})

    this.setState({loading:true})
    getImageByID({id:id}).then((res)=> {
      if(res.success) {
        console.log(res.data)
        this.setState({image: res.data })
        this.handleImageSrc(res.data.thumbnailPath)
        this.setState({isMe: account == res.data.owner})
        // console.log(this.state.image)
      }
    })
    getLatestTx({imageID:id}).then((res)=> {
      if (res.success) {
        const web3 = this.context.web3
        let latestTx = {
          amount: web3.utils.fromWei(res.data.authorShare),
          time: res.data.launchTime
        }
        this.setState({latestTx})
      }
    })
    window.ethereum.on('accountsChanged', (account) => {
      account = account.toString()
      if (account === '') {
        this.props.history.push('/error')
      }
      this.setState({account})
      this.setState({isMe: account == this.state.image.owner})
      window.location.reload()
    });

  }

  handleImageSrc = (path) => {
    let formData = new FormData()
    formData.append("path", path)
    getThumbnail( formData ).then((res) => {
      let blob  = new Blob([res])
      let url = URL.createObjectURL(blob);
      this.setState({imgSrc:url})
      this.setState({loading:false})
    })
  }

  render(){
    return(
    <Container >
      <main style={{ marginTop: "56px"}}>
        <div className="text-center py-3 ">
          <h2>Image Detail</h2>
          <hr></hr>
        </div>
        <div className="row g-3">
          <div className="col-md-8 col-lg-8">
            
            <Card className="mb-4">
              <CardHeader > 
              <div className="d-flex column">
                <h4 className="text-truncate align-middle" style={{maxWidth:"50%", marginBottom:"0"}}>{this.state.image.title}</h4>
              </div>
              </CardHeader>
              {
                this.state.loading ?
                <div class="d-flex justify-content-center" style={{ width:"100%", height:"300px"}}>
                  <div class="spinner-border text-primary  align-self-center" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                :
                <img className="img-responsive center-block rounded" 
                  src= { this.state.imgSrc }
                  alt="No Thumbnail"
                  style={{ maxWidth:"100%" }}
                  />
              }
            </Card>
          </div>
          <div className="col-md-4 col-lg-4 order-md-last" >
            <div className="border rounded ">  
                    <h5 className="my-3 text-center" >Image Info</h5>
                    <h5 className="mx-3" style={{ color:"#228B22"}}>Author &nbsp; 
                    { this.state.account == this.state.image.author?<span class="badge bg-primary">me</span>:<span></span>}
                    </h5>
                    <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.author}</p>
                    <h5 className="mx-3" style={{ color:"#228B22"}}>Owner &nbsp;
                    { this.state.isMe? <span class="badge bg-primary">me</span>:<span></span>}
                    </h5>
                    <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.owner}</p>
                    { this.state.isMe?
                      <div>
                        <h5 className="mx-3" style={{ color:"	#B22222"}}>IPFS Hash (CID)</h5>
                        <p className="mx-2 bg-light border rounded text-center text-break">{this.state.image.ipfsHash}</p>
                      </div>:<div></div>}
                    <h5 className="mx-3" style={{ color:"#4169E1"}}>SHA3(keccak256)</h5>
                    <p className="mx-2 bg-light border rounded text-center text-break">{this.state.image.sha3}</p>
                    <h5 className="mx-3" style={{ color:"#4169E1"}}>Signature</h5>
                    <p className="mx-2 bg-light border rounded text-center text-break">{this.state.image.signature}</p>
                    <h5 className="mx-3" style={{ color:"#9932CC"}}>Release Time</h5>
                    <p className="mx-2 bg-light border rounded text-center text-truncate">{moment(this.state.image.date).format("YYYY-MM-DD HH:mm:ss")}</p>
                    <h5 className="mx-3" style={{ color:"#CDAD00"}}>Transaction Count</h5>
                    <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.txCount}</p>
                    <h5 className="mx-3" style={{ color:"#CDAD00"}}>Latest Transaction Amount (ETH)</h5>
                    <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.latestTx.amount}</p>
                    <h5 className="mx-3" style={{ color:"#CDAD00"}}>Latest Transaction Time</h5>
                    <p className="mx-2 bg-light border rounded text-center text-truncate">{moment(this.state.latestTx.time).format("YYYY-MM-DD HH:mm:ss")}</p>
                </div>
          </div>
        </div>
      </main>
      <Footer/>
    </Container>
    )
  }
}

export default Detail;