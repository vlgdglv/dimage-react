import React from "react";
//bootstraps
import { Container,Card, } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
//components
import Footer from "../components/Footer";
import MyAlert from "../components/MyAlert";
//http
import { getImageByID, getThumbnail } from "../http/image";
import { getLatestTx } from "../http/purchase";
//router
import { withRouter } from "react-router";
//web3
import { web3Context } from '../context/web3Context';
import ContractRelease from '../abis/Release.json'
import  Verification  from '../abis/Verification.json';

//other requires
require('bootstrap')
const moment = require('moment')

class Detail extends React.Component{
  
  static contextType = web3Context;
  constructor(props){
    super(props)
    this.state={
      image:'',
      loading: false,
      latestTx:'',
      isMe:false,
      ipfsHash:'',
      showIpfs:false,
      account:'',
      showAlert: false,
      message:'',
      type:'',
      imageID:'',
      release:'',
      verify:'',
    }
  }

  componentDidMount = () => {
    let id = this.props.match.params.imageID
    this.setState({imageID:id})
    const account = this.context.account
    this.setState({account})
    this.setState({loading:true})
    getImageByID({id:id}).then((res)=> {
      if(res.success) {
        this.setState({image: res.data })
        this.handleImageSrc(res.data.thumbnailPath)
        this.setState({isMe: account.toLowerCase() == res.data.owner})
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
      }else {
        this.setState({latestTx: {amount:"No data", time:"No time"}})
      }
    })
  }

  handleIPFShash = () => {
    const imageID = this.state.imageID
    if (this.state.ipfsHash!='' && this.state.ipfsHash!='error'){ 
      this.setState({showIpfs:true})
      return}
    this.loadReleaseContract().then(release => {
      if (release) {
        release.methods.getIpfsHash(imageID).call({from:this.state.account})
        .then((res)=>{
          if (res != null) {
            this.setState({ipfsHash:res, showIpfs:true})
          }else{
            this.setState({ipfsHash:"error", showIpfs:true})
          }
        })
      }
    })
  }
  
  async loadReleaseContract() {
    const web3 = this.context.web3
    const networkId = await web3.eth.net.getId()
    const releaseNetworkData = ContractRelease.networks[networkId]
    if (releaseNetworkData) {
      const release = new web3.eth.Contract(ContractRelease.abi, releaseNetworkData.address)
      return release
    }else {
      return null
    }
  }
  
  async loadVerifyContract() {
    const web3 = this.context.web3;
    const networkId = await web3.eth.net.getId()
    const verifyNetworkData = Verification.networks[networkId]
    if (verifyNetworkData) {
      const verify = new web3.eth.Contract(Verification.abi, verifyNetworkData.address)
      return verify
    }else {
      return null
    }
  }

  async loadContracts() {
    await this.loadReleaseContract();
    await this.loadVerifyContract();
  }

  async verifySignature (message, signature)  {
    // this.loadVerifyContract().then((verify) => {
    //   verify.methods.verify(message, signature).call()
    //   .then((res) => {
    //     const message = 
    //     <div>
    //       <p>Verified Signer  :  {res}</p>
    //       <p>Owner from blockchain :</p>
    //     </div>
    //     this.popAlert("success",message)
    //   })
    // }).catch((error) => {
    //   this.popAlert("danger", error.message)
    // })
    const verify = await this.loadVerifyContract();
    const release = await this.loadReleaseContract();
    const verifiedSigner = await verify.methods.verify(message, signature).call()
    // console.log(verifiedSigner)
    const owner = await release.methods.getImageOwner(this.state.image.imageID).call()
    // console.log(owner)
    if (verifiedSigner.toLowerCase() == owner.toLowerCase()) {
      const message = 
        <div>
          <p>Owner Matched</p>
          <p>Verified Signer:</p>
          <p>{verifiedSigner}</p>
          <hr></hr>
          <p>Owner from blockchain:</p>
          <p>{owner}</p>
        </div>
      this.popAlert("success",message)
    }else {
        const message = 
          <div>
            <p>Owner UnMatched!</p>
            <p>Verified Signer:</p>
            <p>{verifiedSigner}</p>
            <hr></hr>
            <p>BUT owner from blockchain:</p>
            <p>{owner}</p>
          </div>
        this.popAlert("danger",message)
    }
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
  // view original image
  handleImageView = () => {
    this.props.history.push({pathname:'/image', 
      query:{ ipfsHash: this.state.ipfsHash, 
              account:this.state.account,
              title: this.state.image.title} })
  }

  popAlert = (type,message) => {
    this.setState({type:type,message:message,showAlert:true})
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
                {this.state.loading ?
                  <div className="d-flex justify-content-center" style={{ width:"100%", height:"300px"}}>
                    <div className="spinner-border text-primary  align-self-center" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  :
                  <img className="img-responsive center-block rounded" 
                    src= { this.state.imgSrc }
                    alt="No Thumbnail"
                    style={{ maxWidth:"100%" }} />
                }
              </Card>
              <div>
                <p>
                  <button className="btn btn-outline-primary" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#verify" aria-expanded="false" aria-controls="verify">
                    Need a verification?
                  </button>
                </p>
                <div className="collapse" id="verify">
                  <div className="card card-body">
                    <form onSubmit={(event) => {
                      event.preventDefault()
                      const message = this.imgHash.value
                      const signature = this.signature.value
                      this.verifySignature(message, signature)
                    }}>
                      <div className="form-group">
                        <h6>Image SHA3(keccak256)</h6>
                        <input
                          id="imgHash" type="text" className="form-control"
                          ref={(input) => { this.imgHash = input }}
                          placeholder="sha3 here" required />
                        <hr></hr>
                        <h6>Signature</h6>
                        <input
                          id="signature" type="text" className="form-control mt-2" 
                          ref={(input) => { this.signature = input }}
                          placeholder="signature here" required />
                      </div>
                      <button type="submit" className="btn btn-primary mt-3 ">Verify!</button>
                    </form>
                    <div className="alertplace py-3 d-flex justify-content-center">
                      <MyAlert 
                        show={this.state.showAlert} 
                        message={this.state.message} 
                        type={this.state.type}
                        closeAlert={()=>{this.setState({showAlert: false})}}/>
                    </div> 
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-4 order-md-last" >
              <div className="border rounded ">  
                <h5 className="my-3 text-center" >Image Info</h5>                  
                <h5 className="mx-3">Image ID</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.imageID}</p>
                <h5 className="mx-3" style={{ color:"#228B22"}}>Author &nbsp; 
                { this.state.account == this.state.image.author?<span className="badge bg-primary">me</span>:<span></span>}
                </h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.author}</p>
                <h5 className="mx-3" style={{ color:"#228B22"}}>Owner &nbsp;
                { this.state.isMe? <span className="badge bg-primary">me</span>:<span></span>}
                </h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.owner}</p>
                { this.state.isMe?
                  <div>
                    <h5 className="mx-3" style={{ color:"	#B22222"}}>IPFS Hash (CID)</h5>
                    { this.state.showIpfs? 
                      <div className="d-flex justify-content-center my-1">
                        <button className="btn btn-link btn-sm" onClick={()=>{this.setState({showIpfs:false})}}>hide</button>
                        {this.state.ipfsHash!='' && this.state.ipfsHash!='error'?
                          <button className="btn btn-link btn-sm"
                            onClick={this.handleImageView}>get original image
                          </button> : <span></span>  
                        }
                      </div>
                      :<span></span>}
                    { this.state.showIpfs?
                      <p className="mx-2 bg-light border rounded text-center text-break">
                        {this.state.ipfsHash}
                      </p>  
                      : <div className="mx-2 mb-3 bg-light border rounded text-center">
                          <button className="btn btn-link btn-sm" onClick={this.handleIPFShash}>get IPFS hash from blockchain</button>
                        </div>
                    }
                  </div> : <div></div>}
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

export default withRouter(Detail);