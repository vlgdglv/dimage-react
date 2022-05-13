import React from "react";
import { Container,Dropdown } from "react-bootstrap";
import { web3Context } from "../context/web3Context";
import ContractRelease from '../abis/Release.json'
import MyPagination from "../components/MyPagination";
import Modals from "../components/Modals";
import { getTxByOwner, getTxByPurchaser } from '../http/purchase'
import { getThumbnailByID } from "../http/image";
import { updateTx } from "../http/purchase";
const moment = require('moment')

class Trades extends React.Component {

  static contextType = web3Context;
  constructor(props){
    super(props)
    this.state = {
      account:'',
      balance:'',
      offers:[],
      loadOffer: true,
      offerPage:{
        totPages:1,
        currentPage:1,
      },
      launchPage:{
        totPages:1,
        currentPage:1,
      },
      launches:[],
      loadLaunch:true,
      images:[],
      onTx:'',
      onIdx:'',
      release:'',
      currentPage:1,
      totPages:5,
      offerFilterState:1,
      launchFilterState:1,
      filterContent:'Pending',
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

  getOwnerTx = (owner,curPage,pageCount, state) => {
    console.log(state)
    this.setState({loadOffer: true})
    getTxByOwner({
      currentPage:curPage,
      pageCount:pageCount,
      owner:owner,
      state:state
    }).then((res) => {
      if (res.success) {
        console.log(res)
        let data = res.data
        let offers = data.ptxList
        console.log(offers)
        offers.map((each) => {
          const web3 = this.context.web3
          each.offer = web3.utils.fromWei(each.offer)
          each.authorShare = web3.utils.fromWei(each.authorShare)
          each.ownerShare = web3.utils.fromWei(each.ownerShare)
          each.id = each.imageID
          each.loading = true
          each.imgSrc = ''
        })
        offers.forEach(async offer => {
          offer.imgSrc = await this.handleImageSrc(offer.id)
          offer.loading = false
          this.setState({offers})
        })
        this.setState({offerPage:{totPages:data.totalPages,currentPage:curPage}})
        this.setState({offers: offers})
        this.setState({loadOffer: false})
      }
    })
  }

  getPurchaserTx = (purchaser,curPage,pageCount,state) => {
    this.setState({loadLaunch: true})
    getTxByPurchaser({
      currentPage:curPage,
      pageCount:pageCount,
      purchaser: purchaser,
      state:state
    }).then((res) => { 
      if (res.success) {
        let data = res.data
        let launches = data.ptxList
        console.log(launches)
        launches.map((each) => {
          const web3 = this.context.web3
          each.offer = web3.utils.fromWei(each.offer)
          each.authorShare = web3.utils.fromWei(each.authorShare)
          each.ownerShare = web3.utils.fromWei(each.ownerShare)
          each.id = each.imageID
          each.loading = true
          each.imgSrc = ''
        })
        launches.forEach(async launch => {
          launch.imgSrc = await this.handleImageSrc(launch.id)
          launch.loading = false
          this.setState({launches})
        })
        console.log(data.totalPages)
        this.setState({launchPage:{totPages:data.totalPages,currentPage:curPage}})
        this.setState({launches: launches })
        this.setState({loadLaunch: false})
      }
    })
  }

  componentDidMount = () => {
    const account = this.context.account
    this.setState({account})
    window.ethereum.on('accountsChanged', (account) => {
      console.log("[trade]change account:"+account)
      account = account.toString()
      if (account === '') {
        this.props.history.push('/error')
      }
      this.setState({account})
      window.location.reload()
    });
    this.setState({offerFilterState:1})
    this.setState({launchFilterState:1})
    this.getOwnerTx(account,1,4,1);
    this.getPurchaserTx(account,1,4,1);
  }

  handleConfirm = (event) => {
    event.preventDefault()
    // console.log(event.target.id);
    const tx = this.state.onTx
    const idx = event.target.id;
    const contractAddress = tx.contractAddress;
    const web3 = this.context.web3;
    updateTx({
      contractAddress: tx.contractAddress,
      from: this.context.account,
      oldState: 1,
      newState: 2,
    }).then((res)=>{
      console.log(res)
      let offers = this.state.offers;
      offers[idx].state = 2 
      console.log(offers)
      this.setState({offers: offers})
    })
    // let contractInstance = new web3.eth.Contract(ContractPurchase.abi, contractAddress);
    // contractInstance.methods.confirmPurchase().send({from:this.context.account})
    // .then((res)=>{
    //   console.log(res)
    //   if (res.status){
    //     updateTx({
    //       contractAddress: tx.contractAddress,
    //       from: this.context.account,
    //       oldState: 1,
    //       newState: 2,
    //     }).then((res)=>{
    //       console.log(res)
    //       const offers = this.setState.offers;
    //       offers[idx] = res.data
    //       console.log(offers)
    //       this.setState({offers})
    //     })
    //   }
    // })
  }

  handleDecline = (event) => {
    event.preventDefault()
    console.log(event.target.id);
    const tx = this.state.onTx
    const idx = event.target.id;
    const contractAddress = tx.contractAddress;
    const web3 = this.context.web3;
    updateTx({
      contractAddress: tx.contractAddress,
      from: this.context.account,
      oldState: tx.state,
      newState:-1,
    }).then((res)=>{
      console.log(res)
      let offers = this.state.offers;
      offers[idx].state = -1
      console.log(offers)
      this.setState({offers: offers})
    })
    // let contractInstance = new web3.eth.Contract(ContractPurchase.abi, contractAddress);
    // contractInstance.methods.confirmPurchase().send({from:this.context.account})
    // .then((res)=>{
    //   console.log(res)
    //   if (res.status){
    //     updateTx({
    //       contractAddress: tx.contractAddress,
    //       from: this.context.account,
    //       oldState: 1,
    //       newState: 2,
    //     }).then((res)=>{
    //       console.log(res)
    //       const offers = this.setState.offers;
    //       offers[idx] = res.data
    //       console.log(offers)
    //       this.setState({offers})
    //     })
    //   }
    // })
  }

  handleCancel = (event) => {
    event.preventDefault()
    console.log(event.target.id);
    const tx = this.state.onTx
    console.log(tx)
    const idx = event.target.id;
    const contractAddress = tx.contractAddress;
    const web3 = this.context.web3;
    updateTx({
      contractAddress: tx.contractAddress,
      from: this.context.account,
      oldState: tx.state,
      newState:-2,
    }).then((res)=>{
      console.log(res)
      let launches = this.state.launches;
      launches[idx].state = -2
      console.log(launches)
      this.setState({launches: launches})
    })
    // let contractInstance = new web3.eth.Contract(ContractPurchase.abi, contractAddress);
    // contractInstance.methods.confirmPurchase().send({from:this.context.account})
    // .then((res)=>{
    //   console.log(res)
    //   if (res.status){
    //     updateTx({
    //       contractAddress: tx.contractAddress,
    //       from: this.context.account,
    //       oldState: 1,
    //       newState: 2,
    //     }).then((res)=>{
    //       console.log(res)
    //       const offers = this.setState.offers;
    //       offers[idx] = res.data
    //       console.log(offers)
    //       this.setState({offers})
    //     })
    //   }
    // })
  }

  handleSign = (event) => {
    event.preventDefault()
    // console.log(event.target.id)
    let web3 = this.context.web3;
    let sha3 = "0x5d663a51e6a9748e1abff82c9097f69b568040fd87c1be7e162acb5059de9794"
    let imageID = event.target.id
    const tx = this.state.onTx
    const idx = event.target.id;
    const contractAddress = tx.contractAddress;
    updateTx({
      contractAddress: tx.contractAddress,
      from: this.context.account,
      oldState: tx.state,
      newState:0,
    }).then((res)=>{
      console.log(res)
      let launches = this.state.launches;
      launches[idx].state = 0
      console.log(launches)
      this.setState({launches: launches})
    })

    // this.loadBlockchainData().then(() => {
    //   const release = this.state.release
    //   web3.eth.sign(sha3, this.context.account).then((result)=>{
    //     result = result.toString()
    //     console.log(result)
    //     release.methods.changeSign(imageID,result)
    //     .send({from: this.context.account}).then((res)=> {
          
    //     })
    //   })
    // })
  }
  
  handleOfferPageChange = (ele) => {
    this.getOwnerTx(this.state.account, ele, 4 ,this.state.offerFilterState);
  }

  handleLaunchPageChange = (ele) => {
    this.getPurchaserTx(this.state.account, ele,4, this.state.launchFilterState);
  }

  async handleImageSrc (id)  {
    let formData = new FormData()
    formData.append("imageID", id)
    let res = await getThumbnailByID( formData )
    let blob  = new Blob([res])
    let url = URL.createObjectURL(blob)
    return url 
  }

  render() {

    return (
      <main className="d-flex">
        <Modals confirmModal="confirmModal" declineModal="declineModal" 
                cancelModal="cancelModal" signModal="signModal"
                onTx = {this.state.onTx} onIdx = {this.state.onIdx}
                handleConfirm={this.handleConfirm} handleDecline={this.handleDecline}
                handleCancel={this.handleCancel}  handleSign={this.handleSign} 
          />
        <div className="nav d-flex nav-pills flex-column flex-shrink-0  bg-light" 
          style={{width: "250px", minHeight:"calc(100vh - 50px)", marginTop:"50px"}}
          id="v-pills-tab" role="tablist" aria-orientation="vertical"
          >
          <a href="/profile" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto mt-3 link-dark text-decoration-none">
            <svg className="bi me-2" style={{width:"40", height:"32"}}></svg>
            <span className="fs-4">Me Trades</span>
          </a>
          <hr></hr>
          <div className="nav flex-column nav-pills m-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            <button className="nav-link link-dark active" id="v-pills-offers-tab" 
              data-bs-toggle="pill" data-bs-target="#v-pills-offers" type="button" 
              role="tab" aria-controls="v-pills-overview" aria-selected="true">Offers</button>
            <button className="nav-link link-dark" id="v-pills-tab" 
              data-bs-toggle="pill" data-bs-target="#v-pills-launches" type="button" 
              role="tab" aria-controls="v-pills-launches" aria-selected="false">Launches</button>
           </div>
        </div>

        <div className="tab-content" id="v-pills-tabContent" style={{ width:"calc(100vw - 250px)"}}>
          <div  className="tab-pane fade show active" id="v-pills-offers" role="tabpanel" aria-labelledby="v-pills-offers-tab">
            <Container style={{ maxWidth:"80%"}} >
              <div className="d-flex justify-content-between"  style={{ paddingTop:"75px" }}>
                <h1>Offers for me</h1>
                <Dropdown >
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    {this.state.filterContent}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={()=>{
                        this.setState({offerFilterState:1});this.setState({filterContent:"Pending"});
                        this.getOwnerTx(this.state.account,1,4,1)}}>Pending</Dropdown.Item>
                    <Dropdown.Item onClick={()=>{
                        this.setState({offerFilterState:0});this.setState({filterContent:"Success"});
                        this.getOwnerTx(this.state.account,1,4,0)}}>Success</Dropdown.Item>
                    <Dropdown.Item onClick={()=>{
                        this.setState({offerFilterState:-1});this.setState({filterContent:"Declined"});
                        this.getOwnerTx(this.state.account,1,4,-1)}}>Declined</Dropdown.Item>
                    <Dropdown.Item onClick={()=>{
                        this.setState({offerFilterState:-2});this.setState({filterContent:"Cancelled"});
                        this.getOwnerTx(this.state.account,1,4,-2)}}>Cancelled</Dropdown.Item>
                    <Dropdown.Item onClick={()=>{
                        this.setState({offerFilterState:-3});this.setState({filterContent:"Expired"});
                        this.getOwnerTx(this.state.account,1,4,-3)}}>Expired</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              {this.state.loadOffer ? 
                <div class="d-flex justify-content-center" >
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              :     
              <Container>
              <MyPagination
                totPages={this.state.offerPage.totPages}
                currentPage={this.state.offerPage.currentPage}
                pageClicked={(ele) => this.handleOfferPageChange(ele)}
              >
                {this.state.offers.length == 0 ?
                  <h3 className="m-3 text-center border rounded bg-light" >No data yet</h3>
                  :this.state.offers.map((offer, key) => {
                    let opGroup = <div><h5><span class="badge bg-primary">State</span></h5></div>
                    let timeGroup = <div></div>
                    if (offer.isClosed == 1 && this.state.offerFilterState ==-3){
                      opGroup = <div><h5><span class="badge bg-warning text-dark">Expired</span></h5></div>
                    }else if (offer.state == 1) {
                      opGroup=( 
                        <div className="operation1" >
                          <button className="btn btn-success mx-1" 
                          data-bs-toggle="modal" data-bs-target="#confirmModal"
                          onClick={() => {this.setState({onTx: offer});this.setState({onIdx:key})}}>Confirm</button>
                          <button className="btn btn-secondary mx-1"
                          data-bs-toggle="modal" data-bs-target="#declineModal"
                          onClick={() => {this.setState({onTx: offer});this.setState({onIdx:key})}}>Decline</button>
                        </div>)
                      timeGroup =( <div className="m-2 d-flex justify-content-end align-items-end flex-column">
                          <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                            <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>      
                          </div>)  

                    }else if (offer.state == 0 || offer.state == 2){
                      opGroup = <div className="d-flex align-items-end flex-column">  
                                  <h5><span class="badge bg-success">Success</span></h5>
                                  { offer.prevOwnerShareRatio==0? <div></div>:
                                  <h6><span class="badge bg-info">passive share:{offer.prevOwnerShareRatio}%</span></h6>}
                                </div>
                    }else if (offer.state == -1){
                      opGroup = <div><h5><span class="badge bg-secondary">Declined</span></h5></div>
                    }else if (offer.state == -2){
                      opGroup = <div><h5><span class="badge bg-dark">Cancelled</span></h5></div>
                    } 
                    return(
                      <main>
                      <div class="card m-2">
                        <div class="card-body row d-flex" style={{ padding:"10px"}}>
                          <div className="col-2">
                            {offer.loading?
                              <div class="d-flex justify-content-center" style={{ height:"100px", width:"100px",}}>
                                <div class="spinner-border text-primary  align-self-center" role="status">
                                  <span class="visually-hidden">Loading...</span>
                                </div>
                              </div>
                              :<img className="border-3 rounded" 
                              style={{height:"100px", width:"100px",objectFit:"cover"}} src={offer.imgSrc}/>}
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
            </Container>
          </div>

          <div  className="tab-pane fade" id="v-pills-launches" role="tabpanel" aria-labelledby="v-pills-launches-tab">
            <Container style={{ maxWidth:"80%"}}>  
              {/* My launch */}
              <div className="d-flex justify-content-between" style={{ paddingTop:"75px" }}>
              <h1 >Launched by me</h1>
                <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                      {this.state.filterContent}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={()=>{
                          this.setState({launchFilterState:1});this.setState({filterContent:"Pending"})
                          this.getPurchaserTx(this.state.account,1,4,1)}}>Pending</Dropdown.Item>
                      <Dropdown.Item onClick={()=>{
                          this.setState({launchFilterState:0});this.setState({filterContent:"Success"})
                          this.getPurchaserTx(this.state.account,1,4,0)}}>Success</Dropdown.Item>
                      <Dropdown.Item onClick={()=>{
                          this.setState({launchFilterState:2});this.setState({filterContent:"Signing"})
                          this.getPurchaserTx(this.state.account,1,4,2)}}>Signing</Dropdown.Item>    
                      <Dropdown.Item onClick={()=>{
                          this.setState({launchFilterState:-1});this.setState({filterContent:"Declined"})
                          this.getPurchaserTx(this.state.account,1,4,-1)}}>Declined</Dropdown.Item>
                      <Dropdown.Item onClick={()=>{
                          this.setState({launchFilterState:-2});this.setState({filterContent:"Cancelled"})
                          this.getPurchaserTx(this.state.account,1,4,-2)}}>Cancelled</Dropdown.Item>
                      <Dropdown.Item onClick={()=>{
                          this.setState({launchFilterState:-3});this.setState({filterContent:"Expired"})
                          this.getPurchaserTx(this.state.account,1,4,-3)}}>Expired</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              {this.state.loadLaunch ?
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              :<Container>
              <MyPagination
                totPages={this.state.launchPage.totPages}
                currentPage={this.state.launchPage.currentPage}
                pageClicked={(ele) => this.handleLaunchPageChange(ele)}
              >
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
                  if (offer.isClosed == 1 && this.state.launchFilterState == -3){
                    opGroup = <div><h5><span class="badge bg-warning text-dark">Expired</span></h5></div>
                  }else if (offer.state == 1) {
                    opGroup=( 
                      <div className="d-flex justify-content-end align-items-end flex-column">
                      <button className="btn btn-danger mx-1"
                      data-bs-toggle="modal" data-bs-target="#cancelModal"
                      onClick={() => {this.setState({onTx: offer});this.setState({onIdx:key})}}>Cancel</button>
                    </div>)
                    timeGroup =( <div className="m-2 d-flex justify-content-end align-items-end flex-column">
                      <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                      <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>      
                    </div>)  
                  }else if (offer.state == 0) {
                    opGroup = <div><h5><span class="badge bg-success">Success</span></h5></div>
                  }else if (offer.state == 2){
                    opGroup = (
                      <div className="d-flex justify-content-end align-items-end flex-column">
                        <button className="btn btn-primary mx-1"
                        data-bs-toggle="modal" data-bs-target="#signModal"
                        onClick={() => {this.setState({onTx: offer});this.setState({onIdx:key})}}>Sign Your Image</button>
                      </div>)
                  }else if (offer.state == -1){
                    opGroup = <div><h5><span class="badge bg-secondary">Declined</span></h5></div>
                  }else if (offer.state == -2){
                    opGroup = <div><h5><span class="badge bg-dark">Cancelled</span></h5></div>
                  }
                  return(
                    <main>
                    <div class="card m-2">
                      <div class="card-body row d-flex" style={{ padding:"10px"}}>
                        <div className="col-2">
                        {offer.loading?
                              <div class="d-flex justify-content-center" style={{ height:"100px", width:"100px",}}>
                                <div class="spinner-border text-primary  align-self-center" role="status">
                                  <span class="visually-hidden">Loading...</span>
                                </div>
                              </div>
                              :<img className="border-3 rounded" 
                              style={{height:"100px", width:"100px",objectFit:"cover"}} src={offer.imgSrc}/>}
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
                </MyPagination>
              </Container>
              }
            </Container>
          </div>
        </div>
      </main>
    )
  }
}
export default Trades;