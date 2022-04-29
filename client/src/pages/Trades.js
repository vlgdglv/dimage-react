import React from "react";
import { Container } from "react-bootstrap";

import { web3Context } from "../context/web3Context";

import ContractPurchase from '../abis/Purchase.json'
import { getTxByOwner, getTxByPurchaser } from '../http/purchase'


const requireContext = require.context("../pics", true, /^\.\/.*\.png$/);
const testImages = requireContext.keys().map(requireContext);
const moment = require('moment')
class Trades extends React.Component {

  static contextType = web3Context;
  
  constructor(props){
    super(props)
    this.state = {
      account:'',
      offers:[],
      launches:[],
      images:[],
      onTx:'',
    }
  
  }  

  componentDidMount = () => {
    testImages.sort(() => {return Math.random() - 0.5})
    let images = testImages.slice(0,8)
    this.setState({images})

    window.ethereum.on('accountsChanged', (account) => {
      console.log("[trade]change account:"+account)
      account = account.toString()
      if (account === '') {
        this.props.history.push('/error')
      }
      
      this.setState({account})
    });

    getTxByOwner({
      owner:this.context.account
    }).then((res) => {
      if (res.success) {
        console.log(res.data)
        let offers = res.data
        offers.map((each) => {
          each.offer = this.context.web3.utils.fromWei(each.offer)
        })
        this.setState({offers: offers})
      }
    })

    getTxByPurchaser({
      purchaser: this.context.account
    }).then((res) => {
      if (res.success) {
        this.setState({launches: res.data})
      }
    })

    
  }

  handleConfirm = (event) => {
    event.preventDefault()
    console.log(event.target.id);
    const tx = this.state.onTx;
    const contractAddress = tx.contractAddress;
    const web3 = this.context.web3;
    let contractInstance = new web3.eth.Contract(ContractPurchase.abi, contractAddress);
    contractInstance.methods.confirmPurchase().send({from:this.context.account})
    .then((res)=>{
      console.log(res)

    })
  }

  
  render() {

    return (
      <main>
        {/*modal confirm*/}
        <div class="modal fade" id="confirmModal" data-bs-backdrop="static" data-bs-keyboard="true" 
          tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog"  style={{width:"150%"}}>
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Confirm Transaction!</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div>
                  <div>
                    <span>ImageID : </span>
                    <span className="border rounded">{this.state.onTx.imageID}</span>           
                  </div>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Author:</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.imageAuthor}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Owner (me)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.imageOwner}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Buyer (new owner)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.purchaser}</p>
                  <hr></hr>
                  <div className="d-flex align-items-end flex-column">
                    <div>
                    <span>Author's Share : </span>
                    <span style={{ color:"#8B7500",maxWidth:"10px"}}>{Number(this.state.onTx.offer*0.1).toFixed(6)} ETH</span>
                    </div>
                    <div>
                      <span>Your Share : </span>
                      <span style={{ color:"#8B7500",maxWidth:"10px"}}>{Number(this.state.onTx.offer*0.9).toFixed(6)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-success"
                onClick={this.handleConfirm}
                >Confirm</button>
              </div>
            </div>
          </div>
        </div>
        {/*modal decline*/}
        <div class="modal fade" id="declineModal" data-bs-backdrop="static" data-bs-keyboard="true" 
          tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Decline Transaction?</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div>
                  <div>
                    <span>ImageID : </span>
                    <span className="border rounded">{this.state.onTx.imageID}</span>           
                  </div>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Author:</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.imageAuthor}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Owner (me)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.imageOwner}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Buyer (new owner)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.purchaser}</p>
                  <hr></hr>
                  <div className="d-flex align-items-end flex-column">
                    <div>
                    <span>Author's may get : </span>
                    <span style={{ color:"#8B7E66",maxWidth:"10px"}}>{Number(this.state.onTx.offer*0.1).toFixed(6)} ETH</span>
                    </div>
                    <div>
                      <span>You may get : </span>
                      <span style={{ color:"#8B7E66",maxWidth:"10px"}}>{Number(this.state.onTx.offer*0.9).toFixed(6)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-danger">Decline</button>
              </div>
            </div>
          </div>
        </div>


      <Container style={{ maxWidth:"70%"}}>
          <h1 style={{ paddingTop:"76px" }}>Offers for me</h1>
          <div className="py-2"   >
          {this.state.offers.map((offer, key) => {
              // console.log(key)
              let opGroup = <div><h5><span class="badge bg-primary">State</span></h5></div>
              // if (offer.isClosed == 1){
              //   opGroup = <div><h5><span class="badge bg-warning text-dark">Expired</span></h5></div>
              // }else if (offer.state == 1) {
              //   opGroup=( 
              //     <div className="operation1">
              //       <button className="btn btn-success mx-1"
              //       data-bs-toggle="modal" data-bs-target="#confirmModal"
              //       onClick={() => {this.setState({onTx: offer})}}>Confirm</button>
              //       <button className="btn btn-secondary mx-1"
              //       data-bs-toggle="modal" data-bs-target="#declineModal"
              //       onClick={() => {this.setState({onTx: offer})}}>Decline</button>
              //     </div>
              //   )
              // }else if (offer.state == 0 || offer.state == 2){
              //   opGroup = <div><h5><span class="badge bg-success">Success</span></h5></div>
              // }else if (offer.state == -1){
              //   opGroup = <div><h5><span class="badge bg-secondary">Declined</span></h5></div>
              // }else if (offer.state == -2){
              //   opGroup = <div><h5><span class="badge bg-dark">Cancelled</span></h5></div>
              // }
              return(
                <main>
                 <div class="card m-3">
                  <div class="card-body row d-flex" style={{ padding:"10px"}}>
                    <div className="col-2">
                      <img className="border-3 rounded" 
                        style={{height:"100px", width:"100px",objectFit:"cover"}} src={this.state.images[key]}/>
                    </div>
                    <div className="col-6">
                      <p style={{marginBottom:"0"}}>Contract Address:</p>
                      <p className="text-info text-truncate mb-0">{offer.contractAddress}</p>
                      <p style={{marginBottom:"0"}}>Buyer: </p>
                      <p className="text-secondary text-truncate  mb-0">{offer.purchaser}</p>
                    </div>
                    <div className="col-4">
                        <div className="m-2 d-flex justify-content-end">
                        { opGroup}
                        </div>
                        <div className="m-2 d-flex justify-content-end align-items-end flex-column" >
                          <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                          <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              )
            })
          }
          </div>

          <hr></hr>

          <h1 style={{ paddingTop:"30px" }}>Launched by me</h1>
          {
            this.state.launches.length == 0 ?
            <h3 className="m-3 text-center border rounded bg-light">No data yet</h3>
            :this.state.launches.map((offer, key) => {
              
              return(
                <main>
                 <div class="card m-3">
                  <div class="card-body row d-flex" style={{ padding:"10px"}}>
                    <div className="col-2">
                      <img className="border-3 rounded" 
                        style={{height:"100px", width:"100px",objectFit:"cover"}} src={this.state.images[key]}/>
                    </div>
                    <div className="col-6">
                      <p style={{marginBottom:"0"}}>Contract Address:</p>
                      <p className="text-info text-truncate mb-0">{offer.contractAddress}</p>
                      <p style={{marginBottom:"0"}}>Buyer: </p>
                      <p className="text-secondary text-truncate  mb-0">{offer.purchaser}</p>
                    </div>
                    <div className="col-4">
                        <div className="m-2 d-flex justify-content-end">
                          <div className="operation1">
                            <button className="btn btn-success mx-1"
                            data-bs-toggle="modal" data-bs-target="#confirmModal"
                            onClick={() => {this.setState({onTx: offer})}}>Confirm</button>
                            <button className="btn btn-secondary mx-1"
                            data-bs-toggle="modal" data-bs-target="#declineModal"
                            onClick={() => {this.setState({onTx: offer})}}>Decline</button>
                          </div>
                        </div>
                        <div className="m-2 d-flex justify-content-end align-items-end flex-column" >
                          <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                          <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              )
            })
          }

      </Container>
      </main>
    )
  }
}

export default Trades;