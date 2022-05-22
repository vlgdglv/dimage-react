import React from 'react';
//bootstrap
import { Container } from 'react-bootstrap';
//components
import Footer from '../components/Footer';
import Modals from "../components/Modals";
import MyAlert from "../components/MyAlert";
//http
import { getTxByID, getPrevOwner, updateTx } from '../http/purchase';
import { getThumbnail } from '../http/image';
//web3
import { web3Context } from "../context/web3Context";
import ContractRelease from '../abis/Release.json';
import ContractPurchase from '../abis/Purchase.json';
//other requires
const moment = require('moment');

class Transaction extends React.Component {

  static contextType = web3Context;
  constructor(props){
    super(props)
    this.state = {
      auth: true,
      account:'',
      role:0,              // tx page role, =0: launched by me, =1 offer for me
      tx:'',               // tx information
      image:'',            // image information
      prevOwner:[],        // previous owners address
      prevOwnerShare:[],   // previous owners share
      poIdx:-1,            // me as previous owner's index
      imgSrc:'',           // preview image source
      loadImage: true,     // load flag
      loaded: false,       // load flag
      loading:false,       // load flag
      title:'',            // image title
      message:'',          // alert param
      type:'',             // alert param 
      showAlert:false,     // alert param
    }
  }

  componentDidMount = () => {
    const account = this.context.account
    this.setState({account})
    let id = this.props.match.params.txID
    // get tx information from server(database)
    getTxByID({txID:id}).then((res)=>{
      let data = res.data
      let ptx = res.data.ptx
      const web3 = this.context.web3
      let pos = Number(ptx.offer)-Number(ptx.authorShare)-Number(ptx.ownerShare)
      const offer = Number(ptx.offer)
      ptx.offer = web3.utils.fromWei(ptx.offer)
      ptx.authorShare = web3.utils.fromWei(ptx.authorShare)
      ptx.ownerShare = web3.utils.fromWei(ptx.ownerShare)
      ptx.prevOwnerShare = web3.utils.fromWei(pos.toString())
      this.setState({tx:data.ptx, image:data.image, offer:offer, loaded:true })
      this.checkAuthority(this.context.account)
      //get previous owner information
      getPrevOwner({sha3:data.image.sha3}).then(res=>{
        let polist = res.data
        let poslist = []
        const postb = [0.05,0.04,0.03,0.02,0.01]
        for(let i=0;i<polist.length;i++) { poslist.push(web3.utils.fromWei((offer*postb[i]).toPrecision())) }
        const potb=[0.05,0.09,0.12,0.14,0.15]
        let index=-1
        for(let i=0;i<polist.length;i++) {
          if (polist[i].toLowerCase() == this.context.account.toLowerCase()) {index=i;break;}
        }
        this.setState({prevOwner: polist, prevOwnerPercent:potb[polist.length-1], prevOwnerShare:poslist,poIdx:index})
      })
      //get image thumbnail
      this.handleImageSrc(data.image.thumbnailPath)
    })    
  }

  async loadReleaseData() {
    const web3 = this.context.web3
    const networkId = await web3.eth.net.getId()
    const releaseNetworkData = ContractRelease.networks[networkId]
    if (releaseNetworkData) {
      const release = new web3.eth.Contract(ContractRelease.abi, releaseNetworkData.address)
      this.setState({ release })
    }
  }

  //check authority, only purchaser and owner can view this page
  checkAuthority = (account) => {
    this.setState({auth:true})
    if (account.toLowerCase() == this.state.tx.purchaser) {
      this.setState({title:"Launched by me", role:0})
    }else if (account.toLowerCase() == this.state.tx.imageOwner){
      this.setState({title:"Offer for me", role:1})
    }else {
      this.setState({auth:false})
    }
  }
  // get image thumbnail
  handleImageSrc = (path) => {
    let formData = new FormData()
    formData.append("path", path)
    getThumbnail( formData ).then((res) => {
      let blob  = new Blob([res])
      let url = URL.createObjectURL(blob);
      this.setState({imgSrc:url, loadImage:false})
    })
  }
  // jump to image detail page
  handleImageClick = () => {
    const imageID = this.state.image.imageID
    this.props.history.push({pathname:"/detail/"+imageID})
  }
  // confirm tx
  handleConfirm = () => {
    this.setState({loading:true})
    const web3 = this.context.web3;
    const tx = this.state.tx;
    let contractInstance = new web3.eth.Contract(ContractPurchase.abi, tx.contractAddress);
    contractInstance.methods.confirmPurchase().send({from:this.context.account})
    .then((res)=>{
      if (res.status){
        updateTx({
          contractAddress: tx.contractAddress,
          from: this.context.account,
          oldState: 1,
          newState: 2,
        }).then((res)=>{
          this.setState({loading:false})
          if(res.success){
            const tx = this.state.tx
            let prevOwner = this.state.prevOwner
            tx.state = 2
            prevOwner = [this.context.account, ... prevOwner]
            this.setState({tx:tx, prevOwner:prevOwner})
            this.setState({showAlert:true,type:"success",message:"confirmed!"})
          }else{
            this.setState({showAlert:true,type:"danger",message:res.message})
          }
        }).catch((err) => {
          this.setState({loading:false})
          this.setState({showAlert:true,type:"danger",message:err})
        })
      }
    }).catch((err) => {
      this.setState({loading:false})
      this.setState({showAlert:true,type:"danger",message:err.message})
    })
  }
  // decline tx
  handleDecline = () => {
    this.setState({loading:true})
    const web3 = this.context.web3;
    const tx = this.state.tx;
    let contractInstance = new web3.eth.Contract(ContractPurchase.abi, tx.contractAddress);
    contractInstance.methods.declinePurchase().send({from:this.context.account})
    .then((res)=>{
      if (res.status){
        updateTx({
          contractAddress: tx.contractAddress,
          from: this.context.account,
          oldState: tx.state,
          newState:-1,
        }).then((res)=>{
          this.setState({loading:false})
          if(res.success){
            const tx = this.state.tx
            tx.state = -1
            this.setState({showAlert:true,type:"success",message:"declined!"})
          }else{
            this.setState({showAlert:true,type:"danger",message:res.message})
          }
        }).catch((err) => {
          this.setState({loading:false})
          this.setState({showAlert:true,type:"danger",message:err})
        })
      }
    }).catch((err) => {
      this.setState({loading:false})
      this.setState({showAlert:true,type:"danger",message:err.message})
    })
  }
  // cancel tx
  handleCancel = () => {
    this.setState({loading:true})
    const web3 = this.context.web3;
    const tx = this.state.tx;
    let contractInstance = new web3.eth.Contract(ContractPurchase.abi, tx.contractAddress);
    contractInstance.methods.cancelPurchase().send({from:this.context.account})
    .then((res)=>{
      if (res.status){
        updateTx({
          contractAddress: tx.contractAddress,
          from: this.context.account,
          oldState: tx.state,
          newState:-2,
        }).then((res)=>{
          this.setState({loading:false})
          if(res.success){
            const tx = this.state.tx
            tx.state = -2
            this.setState({showAlert:true,type:"success",message:"cancelled!"})
          }else{
            this.setState({showAlert:true,type:"danger",message:res.message})
          }
        }).catch((err) => {
          this.setState({loading:false})
          this.setState({showAlert:true,type:"danger",message:err})
        })
      }
    }).catch((err) => {
      this.setState({loading:false})
      this.setState({showAlert:true,type:"danger",message:err.message})
    })
  }
  // sign image
  handleSign = () => {
    this.setState({loading:true})
    let web3 = this.context.web3;
    const tx = this.state.tx;
    const imageID = tx.imageID;
    const sha3 = tx.sha3
    this.loadReleaseData().then(() => {
      const release = this.state.release
      web3.eth.sign(sha3, this.context.account).then((result)=>{
        result = result.toString()
        release.methods.changeSign(imageID,result)
        .send({from: this.context.account})
        .on('error',(error) => {
          this.setState({loading: false})
          this.popAlert("danger",error.message)
        })
        .then((res)=> {
          if (res.status){
            updateTx({
              contractAddress: tx.contractAddress,
              from: this.context.account,
              oldState: tx.state,
              newState:0,
              signature:result,
            }).then((res)=>{
              this.setState({loading:false})
              if(res.success){
                const tx = this.state.tx
                tx.state = 0
                this.setState({showAlert:true,type:"success",message:"signature updated!"})
              }else{
                this.setState({showAlert:true,type:"danger",message:res.message})
              }
            })
          }
        })
      }).catch((err) => {
        this.setState({loading:false})
        this.popAlert("danger",err)
      })
    }).catch((err) => {
      this.setState({loading:false})
      this.popAlert("danger",err.message)
    })
  }

  popAlert = (type,message) => { this.setState({type, message, showAlert:true}) }

  closeAlert = () => { this.setState({showAlert:false}) }

  render() {
    let opGroup = <div className="spinner-border text-primary" role="status"></div>
    let statusBadge = <div className="spinner-border text-primary" role="status"></div>
    let message = <div className="spinner-border text-primary my-1" role="status"></div>
    // generate status and operations for every each case
    if (this.state.loaded) {
      const ptx = this.state.tx;
      const image = this.state.image;
      const txState = ptx.state;
      opGroup = (<button className="btn btn-dark disabled">No Operation</button>)
      // role == 0: this tx is launched by me     
      if (this.state.role == 0){
        if ( txState ==  1 ) { 
          if (moment(new Date()).isBefore(this.state.tx.endTime)){ // tx not expired
            if (ptx.imageOwner.toLowerCase() == image.owner.toLowerCase()){ // tx pending, and owner unchanged 
              opGroup= (<button className="btn btn-danger mx-1" 
                data-bs-toggle="modal" data-bs-target="#cancelModal">Cancel</button>)
              statusBadge = (<h5><span className="badge bg-primary roundedr">Pending</span></h5>)
              message = "waiting for owner's action"
            } else { // tx pending, but owner changed, indicates that owner have been accepted other tx
              opGroup= (<button className="btn btn-danger mx-1" data-bs-toggle="modal" 
                data-bs-target="#cancelModal">Cancel to withdraw your ether</button>)
              statusBadge = (<h5><span className="badge bg-secondary rounded">Declined</span></h5>)
              message = "Owner has sold it to someone else"    
            }
          }else {
            opGroup= (<button className="btn btn-danger mx-1" data-bs-toggle="modal" 
            data-bs-target="#cancelModal">Cancel to withdraw your ether</button>)
            statusBadge = (<h5><span className="badge bg-warning rounded text-dark">Expired</span></h5>)
            message = "this has expired, withdraw your ether"    
          }
        }else if ( txState  == 0 ){ //tx success 
          statusBadge = (<h5><span className="badge bg-success rounded">Success</span></h5>)
          message = "You've bought it"
        }else if ( txState == 2) { 
          if (ptx.purchaser.toLowerCase() == image.owner.toLowerCase()) {
            //you still are owner, you should sign it and write signature to bc
            opGroup = <button className="btn btn-primary mx-1" data-bs-toggle="modal" 
              data-bs-target="#signModal">Sign Your Image</button>
            statusBadge = (<h5><span className="badge rounded" style={{ backgroundColor:"#9ACD32"}}>Half Success</span></h5>)
            message = "Sign your image for verification"
          }else {
            //u are not the owner, indicates u sold it before changing sign, try to remeber next time
            opGroup = <button className="btn btn-primary mx-1 disabled" data-bs-toggle="modal" 
              data-bs-target="#signModal">Can't sign it now</button>
            statusBadge = (<h5><span className="badge bg-secondary rounded">Closed</span></h5>)
            message = "You sold it before sign it!"
          }
        }else if ( txState == -1 ) { //owner declined
          statusBadge = (<h5><span className="badge bg-secondary rounded">Declined</span></h5>)
          message = "Owner declined this transaction"
        }else if ( txState == -2 ) { //u cancelled
          statusBadge = (<h5><span className="badge bg-dark rounded">Cancelled</span></h5>)
          message = "You cancelled this transaction"
        }
      //role == 1: this tx is offered for me
      }else if (this.state.role == 1){
        if ( txState == 1 ) {
          if (moment(new Date()).isBefore(this.state.tx.endTime)){
            //before deadline, operation is valid
            opGroup = (
              <div className="operation1" >
                <button className="btn btn-success mx-1" 
                data-bs-toggle="modal" data-bs-target="#confirmModal">Confirm</button>
                <button className="btn btn-secondary mx-1"
                data-bs-toggle="modal" data-bs-target="#declineModal">Decline</button>
              </div>)
            statusBadge = (<h5><span className="badge bg-primary rounded">Pending</span></h5>)
            message = "Waiting for your decision"
          }else{
            //tx expired, u can do nothing
            statusBadge = (<h5><span className="badge bg-warning rounded text-dark">Expired</span></h5>)
            message = "This transaction has expired"
          }
        } else if ( txState==0 || txState==2 ){
          //owner has changed, tx is success from ur viewpoint
          statusBadge = (<h5><span className="badge bg-success rounded">Success</span></h5>)
          //show ur share as previous owner
          let index=this.state.poIdx;
          if (index != -1 && index < 5) {
            message="You still share " + (5-index) +"% of its turnover"
          }else {
            message="You share no profits"
          }
        }else if ( txState == -1){ // u declined
          statusBadge = (<h5><span className="badge bg-secondary">Declined</span></h5>)
          message="You've declined this transaction"
        }else if ( txState == -2){ // purchaser cancelled
          statusBadge = (<h5><span className="badge bg-dark">Cancelled</span></h5>)
          message="Buyer cancelled this transaction"
        }
      }
    }
    return(
      this.state.auth?
      <main>
        <Modals confirmModal="confirmModal" declineModal="declineModal" 
                cancelModal="cancelModal" signModal="signModal" onTx={this.state.tx}
                handleConfirm={this.handleConfirm} handleDecline={this.handleDecline}
                handleCancel={this.handleCancel}  handleSign={this.handleSign}  />
        <Container>
          <main style={{ marginTop: "60px"}}>
            <div className="text-center py-3 ">
              <h2>Transaction Details : {this.state.title}</h2>
              <hr></hr>
            </div>
            <div className='row'>
              {/* left part: contract detail */}
              <div className='col-6'>
                <div className='border rounded'>               
                  <h4 className="text-center py-2" >Contract Info</h4>  
                  <h5 className="mx-3">Contract Address</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.contractAddress}</p>
                  <h5 className="mx-3">Image ID</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageID}</p>
                  <h5 className="mx-3">Purchaser &nbsp; { this.state.account.toLowerCase() == this.state.tx.purchaser?
                  <span className="badge bg-primary">me</span>:<span></span>}</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.purchaser}</p>
                  <h5 className="mx-3">Image Owner &nbsp;
                  { this.state.account.toLowerCase() == this.state.tx.imageOwner?
                  <span className="badge bg-primary">me</span>:<span></span>}</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageOwner}</p>
                  <h5 className="mx-3">Image Author &nbsp; 
                  { this.state.account.toLowerCase() == this.state.tx.imageAuthor?
                  <span className="badge bg-primary">me</span>:<span></span>}</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageAuthor}</p>
                  <h5 className="mx-3">Offer</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{Number(this.state.tx.offer).toFixed(5)} ETH</p>
                  <h5 className="mx-3">End Time &nbsp;
                  {moment(new Date()).isBefore(this.state.tx.endTime)?
                  <span></span>:<span className="badge bg-warning text-dark">Expired</span> }
                  </h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{moment(this.state.tx.endTime).format("YYYY-MM-DD HH:mm:ss")}</p>
                  <a className="btn btn-link" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#collapseShare" aria-expanded="false" aria-controls="collapseShare">
                      Profit shares?
                  </a>
                  <div className="collapse" id="collapseShare">
                    <div>
                      <div className='d-flex justify-content-between bg-light border rounded mx-3 my-1'>
                        <h6 className="mx-3 my-1">Owner</h6>
                        <p className="mx-2 my-1 px-2 text-center" 
                          style={{width:"150px", color:"#8B7500"}}>
                          {Number(this.state.tx.ownerShare).toFixed(6)} ETH</p>
                      </div>
                      <div className='d-flex justify-content-between  bg-light border rounded mx-3 my-1'>
                        <h6 className="mx-3 my-1">Author</h6>
                        <p className="mx-2 my-1 px-2 text-center" 
                          style={{width:"150px", color:"#8B7500"}}>
                          {Number(this.state.tx.authorShare).toFixed(6)} ETH</p>
                      </div>
                    </div>
                    {this.state.prevOwner.length==0?
                    <h6 className="mx-3 my-2" style={{color:"#00CED1"}}>No previous owner</h6>
                    :this.state.prevOwnerShare.map((pos,index)=>{
                        return(
                          <div key={index}  className='d-flex justify-content-between bg-light border rounded mx-3 my-1' >
                            <h6 className="mx-3 my-1" style={{color:"#2F4F4F"}}>Previous Owner #{index+1}</h6>
                            <p className="mx-2 my-1 px-2 text-center"
                            style={{width:"150px", color:"#8B7500"}}>{Number(pos).toFixed(6)} ETH</p>
                          </div>
                        )
                      })
                    }
                    <a className="btn btn-link" type="button" 
                      data-bs-toggle="collapse" data-bs-target="#collapseprevOwner" aria-expanded="false" aria-controls="collapseprevOwner">
                        Previous Owner Address?</a>
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
                </div>
              </div>
              {/* right part: ops and preview */}
              <div className='col-6'>
                <div className='border rounded' >
                  <div className='row py-2'>
                    <div className='col-6 text-center'> {/* status */}
                      <h4 className="text-center" style={{ marginTop:"0px" }}>Status</h4>  
                      { statusBadge }
                    </div>
                    <div className='col-6'>              {/* system message */}
                      <h4 className="text-center" style={{ marginTop:"0px" }}>Message</h4>  
                      <p className="mx-2 bg-light border rounded text-center text-break">
                        { message }
                      </p>
                    </div>                          
                    <hr className='mx-auto' style={{width:"90%"}}></hr>
                    <h4 className="text-center py-1">Operations</h4>  
                    <div className=' d-flex justify-content-center mb-3'>  {/* operations */}
                      { opGroup }
                    </div>
                    {/* processing flag */}
                    <div className="d-flex align-items-center justify-content-center">
                      {this.state.loading ?
                        <div className="d-flex align-items-center justify-content-center">
                          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
                          <div className="mx-1 text-primary">
                            <strong >Processing...</strong>
                          </div>
                        </div>
                        :
                        <MyAlert 
                          show={this.state.showAlert} 
                          message={this.state.message} 
                          type={this.state.type}
                          closeAlert={this.closeAlert}/> }
                    </div>
                  </div>
                </div>
                {/* preview */}
                <div className='border rounded mt-3' >
                  <h4 className="text-center py-2">Preview</h4>  
                  {this.state.loadImage?
                    <div className="d-flex justify-content-center mb-3">
                      <div className="spinner-border text-primary  align-self-center" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    :
                    <div className='text-center'>
                      <a onClick={this.handleImageClick} style={{ padding:"auto",cursor:"pointer" }}>
                        <img className="border-3 rounded"
                          style={{maxHeight:"300px", width:"100%",objectFit:"cover"}} src={this.state.imgSrc}/>
                      </a>
                      <h5 className='py-1'>"{this.state.image.title}"</h5>
                    </div>  }
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </Container>
      </main>
      :
      <h1 className="text-center"  style={{ paddingTop:"150px",paddingLeft:"auto" }}>
        No authority!
      </h1>
    )
  }
}

export default Transaction;