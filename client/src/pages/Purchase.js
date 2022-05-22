import React from "react";
//bootstraps
import { Card, Container } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
//components
import AccountInfo from "../components/AccountInfo";
import Footer from "../components/Footer";
import MyAlert from "../components/MyAlert";
//http
import { newPurchase,getPrevOwner } from "../http/purchase";
import { getImageByID, getThumbnail } from "../http/image";
//web3
import { web3Context } from '../context/web3Context';
import ContractPurchase from '../abis/Purchase.json';
import ContractRelease from "../abis/Release.json";
//other requires

class Purchase extends React.Component{
  
  static contextType = web3Context;
  constructor(props) {
    super(props)
    this.state = {
      account:'',
      image: '',
      imageID:'',
      imgSrc:'',
      isMe:false,
      releaseAddress:'',
      authorPercent:0.3,
      prevOwnerPercent:0,
      loading:false,
      showAlert:false,
      type:'',
      message:'',
      prevOwner:[]
    }
  }

  async loadBlockchainData(id) {
    const web3 = this.context.web3
    const networkId = await web3.eth.net.getId()
    const releaseNetworkData = ContractRelease.networks[networkId]
    if (releaseNetworkData) {
      this.setState({releaseAddress: releaseNetworkData.address})
      const release = new web3.eth.Contract(ContractRelease.abi, releaseNetworkData.address)
      const txCount = await release.methods.getTxCount(id).call()
      let ratio = 0.2
      if (txCount <= 10) { ratio = 0.3 }
      else if (txCount <= 50) { ratio = 0.2}
      else { ratio = 0.15}
      this.setState({authorPercent: ratio})
    }
  }

  componentDidMount = () => {
    let id = this.props.match.params.imageID
    this.setState({imageID:id})
    const account = this.context.account
    const web3 = this.context.web3
    this.setState({account:account, web3:web3})
    this.loadBlockchainData(id)
    //get image information
    getImageByID({id:id}).then((res)=> {
      if(res.success) {
        this.setState({image: res.data, isMe: account.toLowerCase() == res.data.owner.toLowerCase() })
        this.handleImageSrc(res.data.thumbnailPath)
        getPrevOwner({sha3:res.data.sha3}).then(res=>{
          let polist = res.data
          const potb=[0.05,0.09,0.12,0.14,0.15]
          let pop = polist.length == 0? 0 : potb[polist.length-1]
          this.setState({prevOwner: polist, prevOwnerPercent:pop})
        })
      }
    })  
    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
    })
  }

  handlePurchaseSumbit = (event) => {
    if(this.state.image.owner == this.state.account){
      alert('You are the owner');
      return //you cant buy ur own image
    }
    event.preventDefault()
    this.setState({loading: true})
    const web3 = this.context.web3;
    let offerAmount = this.offerAmount.value
    const authorPercent = this.state.authorPercent;
    const prevOwnerPercent = this.state.prevOwnerPercent;
    let authorShare = Number(offerAmount) * authorPercent;
    let ownerShare  = Number(offerAmount) * (1.0 - authorPercent - prevOwnerPercent)

    offerAmount = web3.utils.toWei(offerAmount, 'Ether')

    let contractInstance = new web3.eth.Contract(ContractPurchase.abi)
    
    const releaseAddress = this.state.releaseAddress
    const imageID = this.state.image.imageID;
    const imageOwner = this.state.image.owner.toLowerCase();
    const imageAuthor = this.state.image.author.toLowerCase();
    const purchaser = this.state.account.toLowerCase();
    const sha3 = this.state.image.sha3.toLowerCase();
    const duration = 3600 * 24 * 3; //default purchase duration: 3 day
    //web3: deploying new purchase contract
    contractInstance.deploy({
      data: ContractPurchase.bytecode,
      arguments: [releaseAddress,imageID,purchaser,duration,sha3],
    }).send({from: purchaser, value:offerAmount })
    .on('error',(error) => {
      this.setState({loading: false})
      this.popAlert("danger",error.message)
    })
    .then((newContractInstance) => {
      const address = newContractInstance.options.address
      const contract = new web3.eth.Contract(ContractPurchase.abi, address)
      contract.methods.launchTime().call().then((launchTime) => {
        let obj = {
          contractAddress: address,
          purchaser: purchaser,
          imageOwner: imageOwner,
          imageAuthor: imageAuthor,
          ownerShare: web3.utils.toWei(ownerShare.toFixed(7)),
          authorShare:web3.utils.toWei(authorShare.toFixed(7)),
          sha3:sha3,
          imageID:imageID,
          offer: offerAmount,
          launchTime: launchTime,
          duration: duration
        }
        //update new purchase contract to database
        newPurchase(obj, true).then((res) => {
          this.setState({loading: false})
          if (res.success){
            this.popAlert("success","Purchase Launched! Check it in your Trades page")
          }else{
            this.popAlert("danger",res.message)
          }
        }).catch((error)=>{
          this.setState({loading: false})
          this.popAlert("danger",error)
        })
      })
    })
  }

  //get image thumbnail
  handleImageSrc = (path) => {
    let formData = new FormData()
    formData.append("path", path)
    getThumbnail( formData ).then((res) => {
      let blob  = new Blob([res])
      let url = URL.createObjectURL(blob);
      this.setState({imgSrc:url})
    })
  }

  popAlert = (type,message) => { this.setState({type, message, showAlert:true}) }

  closeAlert = () => { this.setState({showAlert:false}) }

  render() {
    return (
      <Container>
        <main style={{ marginTop: "56px"}}>
          <div className="text-center py-3 ">
            <h2>Purchasing</h2>
            <hr></hr>
          </div>
          <div className="row g-3">
            <div className="col-md-8 col-lg-8">
              <Card className="mb-4">
                <CardHeader className="rounded"> 
                <div className="d-flex column">
                  <h4 className="text-truncate align-middle" style={{maxWidth:"50%", marginBottom:"0"}}>{this.state.image.title}</h4>
                </div>
                </CardHeader>
                <img className="img-responsive center-block rounded" 
                  src= { this.state.imgSrc }
                  alt="No Thumbnail"
                  style={{ maxWidth:"100%",maxHeight:"580px",objectFit:"cover" }}
                />
              </Card>
            </div>
            <div className="col-md-4 col-lg-4 order-md-last" >
              <div className="border rounded mb-4" style={{ marginBottom:"auto" }}>  
                  <h5 className="my-3 text-center" style={{ color:"#008B45"}}>Author &amp; Owner</h5>
                  <h5 className="mx-3">Image ID</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.imageID}</p>
                  <h5 className="mx-3">Author</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.author}</p>
                  <h5 className="mx-3">Owner</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.image.owner}</p>

                  <a className="btn btn-link" type="button" 
                    data-bs-toggle="collapse" data-bs-target="#collapseprevOwner" aria-expanded="false" aria-controls="collapseprevOwner">
                      Previous Owners?
                  </a>
                  <div className="collapse " id="collapseprevOwner">
                    {this.state.prevOwner.length==0?
                    <h6 className="mx-3" style={{color:"#00CED1"}}>No previous owner</h6>
                    :this.state.prevOwner.map((po,index)=>{
                        return(
                          <div key={index}>
                            <h6 className="mx-3" style={{color:"#00CED1"}}>Previous Owner #{index+1}</h6>
                            <p className="mx-2 bg-light border rounded text-center text-truncate">{po}</p>    
                          </div>
                        )
                      })
                    }
                    
                  </div>
              </div>
              <AccountInfo account={this.state.account} balance={this.state.balance}/>
            </div>
          </div>
          <hr></hr>
          <div className="row g-4">
            <div className="col-md-7 col-lg-7 ">
            <h4 className="mb-3">Buy this!</h4>
            <form onSubmit={this.handlePurchaseSumbit}>
              <div className="row g-5">
                <div className="col-12">
                  <div className="row g-3">
                    <div className="col-sm-10" style={{ paddingTop:"0"}}>
                      <input type="number" id="offerAmount"
                          min="0" max="99" step="0.00001"
                          className="form-control rounded"
                          required placeholder="input your offer"
                          ref={(input) => {this.offerAmount = input}}
                      /> 
                    </div>
                    <div className="col-sm-2 " style={{ display:"inline-block",verticalAlign:"middle" }}>
                      <h5 className="py-2">ΞETH</h5>
                    </div>
                  </div>
                </div>
              </div>
              <hr style={{ width:"95%"}} ></hr>
              <div style={{ textAlign:"center" }}>
                {
                  this.state.isMe?
                  <button className="btn btn-primary disabled"  
                  style={{ width:"50%", height:"50px"}}>You are the owner</button>
                  :<button 
                  type="submit"  className="btn btn-primary"
                  style={{ width:"50%", height:"50px"}}
                  >Confirm</button>
                }
                </div>
            </form>
            <div style={{ marginTop:"20px"}}>
              {
                  this.state.loading ?
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                    <div className="mx-1 text-primary">
                      <strong >Continue your operation in MetaMask...</strong>
                    </div>
                  </div>
                  :
                  <MyAlert 
                    show={this.state.showAlert} 
                    message={this.state.message} 
                    type={this.state.type}
                    closeAlert={this.closeAlert}/> 
                }
              </div>
            </div>
            <div className="col-md-5 col-lg-5">
              <div className="my-2">  
                <h5 className="my-3">Tips:</h5>
                <p>1<span>💰</span>Make your offer.</p>
                <p>2<span>📄</span>Deploy contract.</p>
                <p>3<span>☑️</span>Track trade progress in your Profile/Trade page.</p>
                <p>4<span>🖋️</span>Sign your image after owner confirmed.</p>
              </div>
            </div>
          
          </div>
        </main>
        <Footer/>
      </Container>
    )
  }
}

export default Purchase;