import React from 'react'
import { Container } from 'react-bootstrap'
import Footer from '../components/Footer'
import Modals from "../components/Modals";
import { getTxByID,getPrevOwner } from '../http/purchase'
import { getThumbnail } from '../http/image'
import { web3Context } from "../context/web3Context";

const moment = require('moment')
class Transaction extends React.Component {

  static contextType = web3Context;
  constructor(props){
    super(props)
    this.state = {
      auth: true,
      account:'',
      role:0,
      tx:'',
      image:'',
      prevOwner:[],
      imgSrc:'',
      loadImage: true,
      loaded: false,
      title:'',
    }
  }

  componentDidMount = () => {
    const account = this.context.account
    this.setState({account})
    let id = this.props.match.params.txID
    // console.log(id)
    getTxByID({txID:id}).then((res)=>{
      let data = res.data
      let ptx = res.data.ptx
      console.log(data)
      const web3 = this.context.web3
      let pos = Number(ptx.offer)-Number(ptx.authorShare)-Number(ptx.ownerShare)
      ptx.offer = web3.utils.fromWei(ptx.offer)
      ptx.authorShare = web3.utils.fromWei(ptx.authorShare)
      ptx.ownerShare = web3.utils.fromWei(ptx.ownerShare)
      ptx.prevOwnerShare = web3.utils.fromWei(pos.toString())
      this.setState({tx:data.ptx,image:data.image, loaded:true })
      this.checkAuthority(this.context.account)
      getPrevOwner({sha3:data.image.sha3}).then(res=>{
        let polist = res.data
        const potb=[0.05,0.09,0.12,0.14,0.15]
        this.setState({prevOwner: polist, prevOwnerPercent:potb[polist.length-1]})
      })
      this.handleImageSrc(data.image.thumbnailPath)
      window.ethereum.on('accountsChanged', (account) => {
        account = account.toString()
        if (account === '') {
          this.props.history.push('/error')
        }
        this.setState({account})
        this.checkAuthority(account)
        web3.eth.getBalance(account).then((balance)=>{
          this.setState({balance: web3.utils.fromWei(balance)})
          console.log("[tx]"+balance)
        })
      });
    })    
  }

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

  handleImageSrc = (path) => {
    let formData = new FormData()
    formData.append("path", path)
    getThumbnail( formData ).then((res) => {
      let blob  = new Blob([res])
      let url = URL.createObjectURL(blob);
      this.setState({imgSrc:url, loadImage:false})
    })
  }

  handleImageClick = () => {
    console.log(this.state.account)
    const imageID = this.state.image.imageID
    this.props.history.push({pathname:"/detail/"+imageID})
  }

  handleConfirm = () => {

    console.log("confirming")
  }

  handleDecline = () => {
    console.log("declining")
  }

  handleCancel = () => {
    console.log("cancelling")
  }

  handleSign = () => {
    console.log("signing")
  }

  // handleConfirm = (event) => {
  //   event.preventDefault()
  //   this.setState({loading:true})
  //   const tx = this.state.onTx
  //   const idx = event.target.id;
  //   const contractAddress = tx.contractAddress;
  //   const web3 = this.context.web3;
  //   let contractInstance = new web3.eth.Contract(ContractPurchase.abi, contractAddress);
  //   contractInstance.methods.confirmPurchase().send({from:this.context.account})
  //   .then((res)=>{
  //     console.log(res)
  //     if (res.status){
  //       updateTx({
  //         contractAddress: tx.contractAddress,
  //         from: this.context.account,
  //         oldState: 1,
  //         newState: 2,
  //       }).then((res)=>{
  //         console.log(res)
  //         let offers = this.state.offers;
  //         offers[idx].state = 2 
  //         this.setState({loading:false})
  //         this.setState({offers: offers})
  //       }).catch((err) => {
  //         let offers = this.state.offers;
  //         offers[idx].state = -9 
  //         this.setState({loading:false})
  //         this.setState({offers: offers})
  //       })
  //     }
  //   }).catch((err) => {
  //     let offers = this.state.offers;
  //     offers[idx].state = -9 
  //     this.setState({loading:false})
  //     this.setState({offers: offers})
  //   })
  // }

  // handleDecline = (event) => {
  //   event.preventDefault()
  //   this.setState({loading:true})
  //   const tx = this.state.onTx
  //   const idx = event.target.id;
  //   const contractAddress = tx.contractAddress;
  //   const web3 = this.context.web3;
  //   let contractInstance = new web3.eth.Contract(ContractPurchase.abi, contractAddress);
  //   contractInstance.methods.confirmPurchase().send({from:this.context.account})
  //   .then((res)=>{
  //     console.log(res)
  //     if (res.status){
  //       updateTx({
  //         contractAddress: tx.contractAddress,
  //         from: this.context.account,
  //         oldState: tx.state,
  //         newState:-1,
  //       }).then((res)=>{
  //         console.log(res)
  //         let offers = this.state.offers;
  //         offers[idx].state = -1
  //         console.log(offers)
  //         this.setState({offers: offers})
  //       }).catch((err) => {
  //         let offers = this.state.offers;
  //         offers[idx].state = -9 
  //         this.setState({loading:false})
  //         this.setState({offers: offers})
  //       })
  //     }
  //   }).catch((err) => {
  //     let offers = this.state.offers;
  //     offers[idx].state = -9 
  //     this.setState({loading:false})
  //     this.setState({offers: offers})
  //   })
  // }

  // handleCancel = (event) => {
  //   event.preventDefault()
  //   this.setState({loading:true})
  //   const tx = this.state.onTx
  //   // console.log(tx)
  //   const idx = event.target.id;
  //   const contractAddress = tx.contractAddress;
  //   const web3 = this.context.web3;
  //   let contractInstance = new web3.eth.Contract(ContractPurchase.abi, contractAddress);
  //   contractInstance.methods.confirmPurchase().send({from:this.context.account})
  //   .then((res)=>{
  //     console.log(res)
  //     if (res.status){
  //       updateTx({
  //         contractAddress: tx.contractAddress,
  //         from: this.context.account,
  //         oldState: tx.state,
  //         newState:-2,
  //       }).then((res)=>{
  //         console.log(res)
  //         let launches = this.state.launches;
  //         launches[idx].state = -2
  //         this.setState({loading:false})
  //         this.setState({launches: launches})
  //       }).catch((err) => {
  //         let launches = this.state.launches;
  //         launches[idx].state = -9 
  //         this.setState({loading:false})
  //         this.setState({launches: launches})
  //       })
  //     }
  //   }).catch((err) => {
  //     let offers = this.state.offers;
  //     offers[idx].state = -9 
  //     this.setState({loading:false})
  //     this.setState({offers: offers})
  //   })
  // }

  // handleSign = (event) => {
  //   event.preventDefault()
  //   this.setState({loading:true})
  //   let web3 = this.context.web3;
  //   const tx = this.state.onTx;
  //   console.log(tx)
  //   const imageID = tx.imageID;
  //   const sha3 = tx.sha3
  //   const idx = event.target.id;
  //   const contractAddress = tx.contractAddress;
  //   this.loadBlockchainData().then(() => {
  //     const release = this.state.release
  //     web3.eth.sign(sha3, this.context.account).then((result)=>{
  //       result = result.toString()
  //       console.log(result)
  //       release.methods.changeSign(imageID,result)
  //       .send({from: this.context.account}).then((res)=> {
  //         if (res.status){
  //           updateTx({
  //             contractAddress: tx.contractAddress,
  //             from: this.context.account,
  //             oldState: tx.state,
  //             newState:0,
  //             signature:result,
  //           }).then((res)=>{
  //             let launches = this.state.launches;
  //             launches[idx].state = 0
  //             this.setState({loading:false})
  //             this.setState({launches: launches})
  //           })
  //         }
  //       })
  //     }).catch((err) => {
  //       let launches = this.state.launches;
  //       launches[idx].state = -9 
  //       this.setState({loading:false})
  //       this.setState({launches: launches})
  //     })
  //   }).catch((err) => {
  //     this.setState({loading:false})
  //     let launches = this.state.launches;
  //     launches[idx].state = -9 
  //     console.log(launches)
  //     this.setState({launches: launches})
  //   })
  // }

  render() {
    // let opGroup = (<button className="btn btn-dark disabled">No Operation</button>)
    // let statusBadge = (<h5><span class="badge bg-primary mx-2 border rounded text-center">status</span></h5>)
    // let message = "No message"
    let opGroup = <div class="spinner-border text-primary" role="status"></div>
    let statusBadge = <div class="spinner-border text-primary" role="status"></div>
    let message = <div class="spinner-border text-primary my-1" role="status"></div>
    if (this.state.loaded) {
      // role == 0 launch
      // role == 1 offer
      const ptx = this.state.tx;
      const image = this.state.image;
      const txState = 1;
      console.log(this.state.tx)
      console.log(ptx)
      if (this.state.role == 0){
        if ( txState ==  1 ) { 
          if (ptx.imageOwner.toLowerCase() == image.owner.toLowerCase()){
            opGroup= (<button className="btn btn-danger mx-1" 
              data-bs-toggle="modal" data-bs-target="#cancelModal">Cancel</button>)
            statusBadge = (<h5><span class="badge bg-primary roundedr">Pending</span></h5>)
            message = "waiting for owner's action"
          } else {
            opGroup= (<button className="btn btn-danger mx-1" data-bs-toggle="modal" 
              data-bs-target="#cancelModal">Cancel to withdraw your ether</button>)
            statusBadge = (<h5><span class="badge bg-secondary rounded">Declined</span></h5>)
            message = "Owner has sold it to someone else"    
          }
        }else if ( txState  == 0 ){
          statusBadge = (<h5><span class="badge bg-success rounded">Success</span></h5>)
          message = "You've bought it"
        }else if ( txState == 2) {
          if (ptx.imageOwner.toLowerCase() == image.owner.toLowerCase()) {
            opGroup = <button className="btn btn-primary mx-1" data-bs-toggle="modal" 
              data-bs-target="#signModal">Sign Your Image</button>
            statusBadge = (<h5><span class="badge rounded" style={{ backgroundColor:"#9ACD32"}}>Half Success</span></h5>)
            message = "Sign your image for verification"
          }else {
            opGroup = <button className="btn btn-primary mx-1 disabled" data-bs-toggle="modal" 
              data-bs-target="#signModal">Can't sign it now</button>
            statusBadge = (<h5><span class="badge bg-secondary rounded">Closed</span></h5>)
            message = "You sold it before sign it!"
          }
        }else if ( txState == -1 ) {
          statusBadge = (<h5><span class="badge bg-secondary rounded">Declined</span></h5>)
          message = "Owner declined this transaction"
        }else if ( txState == -2 ) {
          statusBadge = (<h5><span class="badge bg-dark rounded">Cancelled</span></h5>)
          message = "You cancelled this transaction"
        }
      }else if (this.state.role == 1){
        if ( txState == 1 ) {
          if (moment(new Date()).isBefore(this.state.tx.endTime)){
            opGroup = (
              <div className="operation1" >
                <button className="btn btn-success mx-1" 
                data-bs-toggle="modal" data-bs-target="#confirmModal">Confirm</button>
                <button className="btn btn-secondary mx-1"
                data-bs-toggle="modal" data-bs-target="#declineModal">Decline</button>
              </div>)
            statusBadge = (<h5><span class="badge bg-primary rounded">Pending</span></h5>)
            message = "Waiting for your decision"
          }else{
            statusBadge = (<h5><span class="badge bg-warning rounded text-dark">Expired</span></h5>)
            message = "This transaction has expired"
          }
        } else if ( txState==0 || txState==2 ){
          statusBadge = (<h5><span class="badge bg-success rounded">Success</span></h5>)
          const polist = this.state.prevOwner
          console.log(polist)
          let index=-1;
          for(let i=0;i<polist.length;i++) {
            if (polist[i].toLowerCase() == this.context.account.toLowerCase()) {index=i;break;}
          }
          if (index != -1 && index < 5) {
            message="You still share " + (5-index) +"% of its turnover"
          }else {
            message="You share no profits"
          }
        }else if ( txState == -1){
          statusBadge = (<h5><span class="badge bg-secondary">Declined</span></h5>)
          message="You've declined this transaction"
        }else if ( txState == -2){
          statusBadge = (<h5><span class="badge bg-dark">Cancelled</span></h5>)
          message="Buyer cancelled this transaction"
        }
      }
    }
    return(
      this.state.auth?
      <main>
        <Modals confirmModal="confirmModal" declineModal="declineModal" 
                cancelModal="cancelModal" signModal="signModal"
                onTx={this.state.tx}  onIdx={this.state.onIdx}
                handleConfirm={this.handleConfirm} handleDecline={this.handleDecline}
                handleCancel={this.handleCancel}  handleSign={this.handleSign}  />
        <Container>
          <main style={{ marginTop: "60px"}}>
            <div className="text-center py-3 ">
              <h2>Transaction Details : {this.state.title}</h2>
              <hr></hr>
            </div>
            <div className='row'>
              <div className='col-6'>
                <div className='border rounded'>               
                  <h4 className="text-center py-2" >Contract Info</h4>  
                  <h5 className="mx-3">Contract Address</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.contractAddress}</p>
                  <h5 className="mx-3">Image ID</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageID}</p>
                  <h5 className="mx-3">Purchaser &nbsp; { this.state.account.toLowerCase() == this.state.tx.purchaser?
                  <span class="badge bg-primary">me</span>:<span></span>}</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.purchaser}</p>
                  <h5 className="mx-3">Image Owner &nbsp;
                  { this.state.account.toLowerCase() == this.state.tx.imageOwner?
                  <span class="badge bg-primary">me</span>:<span></span>}</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageOwner}</p>
                  <h5 className="mx-3">Image Author &nbsp; 
                  { this.state.account.toLowerCase() == this.state.tx.imageAuthor?
                  <span class="badge bg-primary">me</span>:<span></span>}</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageAuthor}</p>
                  <h5 className="mx-3">Offer</h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{Number(this.state.tx.offer).toFixed(6)} ETH</p>
                  <h5 className="mx-3">End Time &nbsp;
                  {moment(new Date()).isBefore(this.state.tx.endTime)?
                  <span></span>:<span class="badge bg-warning text-dark">Expired</span> }
                  </h5>
                  <p className="mx-2 bg-light border rounded text-center text-truncate">{moment(this.state.tx.endTime).format("YYYY-MM-DD HH:mm:ss")}</p>
                  <a class="btn btn-link" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#collapseShare" aria-expanded="false" aria-controls="collapseShare">
                      Profit shares?
                  </a>
                  <div className="collapse" id="collapseShare">
                    <div className=''>
                    {this.state.prevOwner.length==0?
                    <h6 className="mx-3" style={{color:"#00CED1"}}>No previous owner</h6>
                    :this.state.prevOwner.map((po,index)=>{
                        return(
                          <div key={index}>
                            <div className='d-flex justify-content-between'>
                              <h6 className="mx-3 my-1" style={{color:"#00CED1"}}>Previous Owner #{index+1}</h6>
                              <p className="mx-2  my-1 px-2 bg-light border rounded ">5.0 ETH</p>
                            </div>
                            <div className='d-flex justify-content-between'>
                              <h6 className="mx-3 " style={{color:"#00CED1"}}>Address</h6>
                              <p className="mx-2 px-2 bg-light border rounded text-center text-truncate">{po}</p>    
                            </div>
                          </div>
                        )
                      })
                    }
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-6'>
                <div className='border rounded' >
                  <div className='row py-2'>
                    <div className='col-6 text-center'>
                      <h4 className="text-center" style={{ marginTop:"0px" }}>Status</h4>  
                       {statusBadge}
                    </div>
                    <div className='col-6'>
                      <h4 className="text-center" style={{ marginTop:"0px" }}>Message</h4>  
                      <p className="mx-2 bg-light border rounded text-center text-break">
                        {message}
                      </p>
                    </div>
                    
                    <hr className='mx-auto' style={{width:"90%"}}></hr>
                    <h4 className="text-center py-1">Operations</h4>  
                    <div className=' d-flex justify-content-center mb-3'> 
                      { opGroup }
                    </div>
                  </div>
                  
                </div>

                <div className='border rounded mt-3' >
                  <h4 className="text-center py-2">Preview</h4>  
                  {this.state.loadImage?
                      <div class="d-flex justify-content-center mb-3">
                        <div class="spinner-border text-primary  align-self-center" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      :<div className='text-center'>
                        <a onClick={this.handleImageClick} style={{ padding:"auto",cursor:"pointer" }}>
                          <img className="border-3 rounded"
                            style={{maxHeight:"300px", width:"100%",objectFit:"cover"}} src={this.state.imgSrc}/>
                        </a>
                        <h5 className='py-1'>"{this.state.image.title}"</h5>
                      </div>
                      }
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </Container>
      </main>
      :<h1 className="text-center" 
      style={{ paddingTop:"150px",paddingLeft:"auto" }}>No authority!</h1>
    )
  }
}

export default Transaction;