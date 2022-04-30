import React from "react";
import { Container } from "react-bootstrap";

import { web3Context } from "../context/web3Context";

import ContractRelease from '../abis/Release.json'
import ContractPurchase from '../abis/Purchase.json'

import { getTxByOwner, getTxByPurchaser } from '../http/purchase'
import Footer from "../components/Footer";
import MyPagination from "../components/MyPagination";

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
      loadOffer: true,
      launches:[],
      loadLaunch:true,
      images:[],
      onTx:'',
      release:'',
      currentPage:1,
      totPages:5,
    }
  
  }  

  async loadBlockchainData() {
    const web3 = this.context.web3
    const networkId = await web3.eth.net.getId()
    const releaseNetworkData = ContractRelease.networks[networkId]
    if (releaseNetworkData) {
      const release = new web3.eth.Contract(ContractRelease.abi, releaseNetworkData.address)
      this.setState({ release })

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
        this.setState({loadOffer: false})
      }
    })

    getTxByPurchaser({
      purchaser: this.context.account
    }).then((res) => {
      let offers = res.data
        offers.map((each) => {
          each.offer = this.context.web3.utils.fromWei(each.offer)
        })
      if (res.success) {
        this.setState({launches: res.data})
        this.setState({loadLaunch: false})
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

  handleSign = (event) => {
    event.preventDefault()
    // console.log(event.target.id)
    let web3 = this.context.web3;
    let sha3 = "0x5d663a51e6a9748e1abff82c9097f69b568040fd87c1be7e162acb5059de9794"
    let imageID = event.target.id
    console.log(imageID)
    this.loadBlockchainData().then(() => {
      const release = this.state.release
      web3.eth.sign(sha3, this.context.account).then((result)=>{
        result = result.toString()
        console.log(result)
        release.methods.changeSign(imageID,result)
        .send({from: this.context.account}).then((res)=> {
          
        })
      })
    })
  }
  
  handlePageChange = (ele) => {
    console.log(ele)
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
        {/*modal cancel */}
        <div class="modal fade" id="cancelModal" data-bs-backdrop="static" data-bs-keyboard="true" 
          tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Cancel Transaction?</h5>
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
                  <p style={{marginBottom:"0"}}>Owner</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.imageOwner}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Buyer (me)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.state.onTx.purchaser}</p>
                  <hr></hr>
                  <div className="d-flex align-items-end flex-column">
                    <div>
                    <span>withdraw your offer : </span>
                    <span style={{ color:"#8B7E66",maxWidth:"10px"}}>{Number(this.state.onTx.offer).toFixed(6)} ETH</span>
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
          {this.state.loadOffer ? 
            <div class="d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          :
          
          <Container className="py-2">
          <MyPagination
            totPages={this.state.totPages}
            currentPage={this.state.currentPage}
            pageClicked={(ele) => this.handlePageChange(ele)}
          >
            {this.state.offers.length == 0 ?
              <h3 className="m-3 text-center border rounded bg-light">No data yet</h3>
              :this.state.offers.map((offer, key) => {
                // console.log(key)
                let opGroup = <div><h5><span class="badge bg-primary">State</span></h5></div>
                let timeGroup = <div></div>
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
                //     </div>)
                // timeGroup =( <div className="m-2 d-flex justify-content-end align-items-end flex-column">
                //     <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                //     <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>      
                //   </div>)  
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
                          <div>
                          { timeGroup }
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>
                )
              })
            }
            </MyPagination>
            </Container>
          
          }

          <hr></hr>

          <h1 style={{ paddingTop:"30px" }}>Launched by me</h1>
          {this.state.loadLaunch ?
            <div class="d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          :
          <div className="py-2">
          {this.state.launches.length == 0 ?
            <h3 className="m-3 text-center border rounded bg-light">No data yet</h3>
            :this.state.launches.map((offer, key) => {
              let opGroup = ( 
                    <div className="d-flex justify-content-end align-items-end flex-column">
                      <h5><span class="badge bg-primary">almost success</span></h5>
                      <button className="btn btn-outline-dark" id={offer.imageID}
                        onClick={this.handleSign}>Sign Your Image</button>
                    </div>
                  )
              let timeGroup = <div></div> 
              // if (offer.isClosed == 1){
              //   opGroup = <div><h5><span class="badge bg-warning text-dark">Expired</span></h5></div>
              // }else if (offer.state == 1) {
              //   opGroup=( 
              //     <div className="d-flex justify-content-end align-items-end flex-column">
              //     <button className="btn btn-danger mx-1"
              //     data-bs-toggle="modal" data-bs-target="#cancelModal"
              //     onClick={() => {this.setState({onTx: offer})}}>Cancel</button>
              //   </div>
              // let timeGroup =( <div className="m-2 d-flex justify-content-end align-items-end flex-column">
              //     <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
              //     <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>      
              //   </div>)  
              //)
              // }else if (offer.state == 0) {
              //   opGroup = <div><h5><span class="badge bg-success">Success</span></h5></div>
              // }else if (offer.state == 2){
              //   opGroup = (<div className="d-flex justify-content-end align-items-end flex-column">
              //          <button className="btn btn-primary mx-1">Sign Your Image</button>
              //          </div>)
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
                      <p style={{marginBottom:"0"}}>Owner: </p>
                      <p className="text-secondary text-truncate  mb-0">{offer.imageOwner}</p>
                    </div>
                    <div className="col-4">
                        <div className="m-2 d-flex justify-content-end">
                          {opGroup}
                        </div>
                        <div>
                          {timeGroup}
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              )
            })
          }
        </div>
          }
          

      </Container>
      <Footer />
      </main>
    )
  }
}

export default Trades;