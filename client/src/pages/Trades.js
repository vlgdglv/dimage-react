import React from "react";
//bootstraps
import { Container,Dropdown } from "react-bootstrap";
//components
import MyPagination from "../components/MyPagination";
import AccountInfo from "../components/AccountInfo";
//http
import { getTxByOwner, getTxByPurchaser } from '../http/purchase'
import { getThumbnailByID } from "../http/image";
//web3
import { web3Context } from "../context/web3Context";
//other requires
const moment = require('moment')

class Trades extends React.Component {

  static contextType = web3Context;
  constructor(props){
    super(props)
    this.state = {
      account:'',
      balance:'',
      offers:[],            // offers for me list
      loadOffer: true,      // offer list loading 
      offerPage:{ totPages:1, currentPage:1},
      launchPage:{ totPages:1, currentPage:1 },
      launches:[],          // launched by me list
      loadLaunch:true,      // launch list loading
      currentPage:1,        //used by pagination
      totPages:5,           //used by pagination
      offerFilterState:3,   //offers filter
      launchFilterState:3,  //launches filter
      filterContent:'All',  //filter text for show
      loading: false        //page loading 
    }
  }

  componentDidMount = () => {
    const account = this.context.account
    this.setState({account})
    console.log(this.state.account)
    const web3 = this.context.web3
    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
    })
    this.getOwnerTx(account,1,4,3);
    this.getPurchaserTx(account,1,4,3);
  }

  //get offer list
  getOwnerTx = (owner,curPage,pageCount, state) => {
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
        const web3 = this.context.web3
        offers.map((each) => {
          let pos = Number(each.offer)-Number(each.authorShare)-Number(each.ownerShare)
          each.offer = web3.utils.fromWei(each.offer)
          each.authorShare = web3.utils.fromWei(each.authorShare)
          each.ownerShare = web3.utils.fromWei(each.ownerShare)
          each.prevOwnerShare = web3.utils.fromWei(pos.toString())
          each.id = each.imageID
          each.loading = true
          each.imgSrc = ''
        })
        // load images for each tx
        offers.forEach(async offer => {
          offer.imgSrc = await this.handleImageSrc(offer.id)
          offer.loading = false
          this.setState({offers})
        })
        this.setState({offerPage:{totPages:data.totalPages,currentPage:curPage}})
        this.setState({offers: offers, loadOffer: false})
      }
    })
  }

  //get launch list
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
        const web3 = this.context.web3
        launches.map((each) => {
          let pos = Number(each.offer)-Number(each.authorShare)-Number(each.ownerShare)
          each.offer = web3.utils.fromWei(each.offer)
          each.authorShare = web3.utils.fromWei(each.authorShare)
          each.ownerShare = web3.utils.fromWei(each.ownerShare)
          each.prevOwnerShare = web3.utils.fromWei(pos.toString())
          each.id = each.imageID
          each.loading = true
          each.imgSrc = ''
        })
        // load images for each tx
        launches.forEach(async launch => {
          launch.imgSrc = await this.handleImageSrc(launch.id)
          launch.loading = false
          this.setState({launches})
        })
        this.setState({launchPage:{totPages:data.totalPages,currentPage:curPage}})
        this.setState({launches: launches, loadLaunch: false })
      }
    })
  }
  
  handleOfferPageChange = (ele) => { this.getOwnerTx(this.state.account, ele, 4 ,this.state.offerFilterState) }

  handleLaunchPageChange = (ele) => { this.getPurchaserTx(this.state.account, ele,4, this.state.launchFilterState) }

  handleTxClick = (event) => {
    event.preventDefault()
    const txID = event.target.id
    this.props.history.push({pathname:"/tx/"+txID})
  }

  //get image thumbnail
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
        {/* side bar */}
        <div className="nav d-flex nav-pills flex-column flex-shrink-0  bg-light" 
          style={{width: "250px", minHeight:"calc(100vh - 50px)", marginTop:"50px"}}
          id="v-pills-tab" role="tablist" aria-orientation="vertical" >
          <a href="/trades" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto mt-3 link-dark text-decoration-none">
            <svg className="bi me-2" style={{width:"40", height:"32"}}></svg>
            <span className="fs-4">Me Trades</span>
          </a>
          <hr></hr>
          {/* tab buttons */}
          <div className="nav flex-column nav-pills m-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            {/* offers tab button */}
            <button className="nav-link link-dark active" id="v-pills-offers-tab" 
              data-bs-toggle="pill" data-bs-target="#v-pills-offers" type="button" 
              role="tab" aria-controls="v-pills-overview" aria-selected="true">Offers</button>
            {/* launches tab button */}
            <button className="nav-link link-dark" id="v-pills-tab" 
              data-bs-toggle="pill" data-bs-target="#v-pills-launches" type="button" 
              role="tab" aria-controls="v-pills-launches" aria-selected="false">Launches</button>
          </div>
          <div style={{width: "250px", padding:"10px", paddingTop:"30px"}}>
            <AccountInfo account={this.state.account} balance={this.state.balance}/>
          </div>
        </div>
        {/* tab content */}
        <div className="tab-content" id="v-pills-tabContent" style={{ width:"calc(100vw - 250px)"}}>
          {/* offer tab */}
          <div  className="tab-pane fade show active" id="v-pills-offers" 
            role="tabpanel" aria-labelledby="v-pills-offers-tab">
            <Container style={{ maxWidth:"80%"}} >
              <div className="d-flex justify-content-between" style={{ paddingTop:"75px" }}>
                <h1>Offers for me</h1>
                {/* offer filter drop down */}
                <Dropdown >
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    {this.state.filterContent}
                  </Dropdown.Toggle>
                  <Dropdown.Menu> 
                    <Dropdown.Item onClick={()=>{
                        this.setState({offerFilterState:3});this.setState({filterContent:"All"});
                        this.getOwnerTx(this.state.account,1,4,3)}}>All</Dropdown.Item>
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
                <div className="d-flex justify-content-center" >
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div> 
              :     
              <Container>
                <MyPagination
                  totPages={this.state.offerPage.totPages}
                  currentPage={this.state.offerPage.currentPage}
                  pageClicked={(ele) => this.handleOfferPageChange(ele)} 
                >
                  {/* generate status badge */}
                  {this.state.offers.length == 0 ?
                    <h3 className="m-3 text-center border rounded bg-light" >No data yet</h3>
                    : 
                    this.state.offers.map((offer, key) => {
                    let badge = <h5><span className="badge bg-primary align-middle">Status</span></h5>
                    if (offer.isClosed == 1 && this.state.offerFilterState ==-3){
                      badge = <div><h5><span className="badge bg-warning text-dark">Expired</span></h5></div>
                    }else if (offer.state == 1) {
                      badge= <div><h5><span className="badge bg-primary">Pending</span></h5></div>
                    }else if (offer.state == 0 || offer.state == 2){
                      badge = <div><h5><span className="badge bg-success">Success</span></h5></div>
                    }else if (offer.state == -1){
                      badge = <div><h5><span className="badge bg-secondary">Declined</span></h5></div>
                    }else if (offer.state == -2){
                      badge = <div><h5><span className="badge bg-dark">Cancelled</span></h5></div>
                    } 
                    return(
                      <div key={key} className="card m-2">
                        <div className="card-body row d-flex" style={{ padding:"10px"}}>
                          {/* thumbnail */}
                          <div className="col-2">
                            {offer.loading?
                            <div className="d-flex justify-content-center" style={{ height:"100px", width:"100px",}}>
                              <div className="spinner-border text-primary  align-self-center" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div> :
                            <div>
                              <a onClick={this.handleTxClick} style={{ cursor:"pointer" }}>
                              <img className="border-3 rounded" id={offer.txID  }
                                style={{height:"100px", width:"100px",objectFit:"cover"}} src={offer.imgSrc}/>
                              </a>
                            </div>}
                          </div>
                          {/* contract short info */}
                          <div className="col-6">
                            <p style={{marginBottom:"0"}}>Contract Address:</p>
                            <a onClick={this.handleTxClick} style={{ cursor:"pointer" }}>
                            <p className="text-info text-truncate mb-0" id={offer.txID  }>{offer.contractAddress}</p></a>
                            <p style={{marginBottom:"0"}}>Buyer: </p>
                            <p className="text-secondary text-truncate  mb-0">{offer.purchaser}</p>
                          </div>
                          {/* details */}
                          <div className="col-4">
                            <div className="m-2 d-flex justify-content-end align-middle">
                              {badge}
                              <button className="btn btn-info mx-1"  id={offer.txID}
                              onClick={this.handleTxClick}>See Detail</button>
                            </div>
                            <div className="m-2 d-flex justify-content-end align-items-end flex-column">
                              <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                              <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>      
                            </div>
                          </div>
                        </div>
                      </div>
                      )
                    })
                  }
                </MyPagination>
              </Container> }
            </Container>
          </div>

          {/* launch tab */}
          <div  className="tab-pane fade" id="v-pills-launches" 
            role="tabpanel" aria-labelledby="v-pills-launches-tab">
            <Container style={{ maxWidth:"80%"}}>  
              {/* My launch */}
              <div className="d-flex justify-content-between" style={{ paddingTop:"75px" }}>
                <h1 >Launched by me</h1>
                {/* offer filter drop down */}
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    {this.state.filterContent}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={()=>{
                      this.setState({launchFilterState:3});this.setState({filterContent:"All"});
                      this.getPurchaserTx(this.state.account,1,4,3)}}>All</Dropdown.Item>
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
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              {this.state.loadLaunch ?
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div> 
              :
              <Container>
                <MyPagination
                  totPages={this.state.launchPage.totPages}
                  currentPage={this.state.launchPage.currentPage}
                  pageClicked={(ele) => this.handleLaunchPageChange(ele)}
                >
                  {/* generate status badge */}
                  {this.state.launches.length == 0 ?
                    <h3 className="m-3 text-center border rounded bg-light">No data yet</h3>
                    : 
                    this.state.launches.map((offer, key) => {
                    let badge = <h5><span className="badge bg-primary align-middle">Status</span></h5>
                    if (offer.state == 1) {
                      badge= <div><h5><span className="badge bg-primary">Pending</span></h5></div>
                    }else if (offer.state == 0){
                      badge = <div><h5><span className="badge bg-success">Success</span></h5></div>
                    }else if(offer.state == 2){
                      badge = <h5><span className="badge" style={{ backgroundColor:"#9ACD32"}}>Half Success</span></h5>
                    }else if (offer.state == -1){
                      badge = <div><h5><span className="badge bg-secondary">Declined</span></h5></div>
                    }else if (offer.state == -2){
                      badge = <div><h5><span className="badge bg-dark">Cancelled</span></h5></div>
                    } 
                    return(
                      <div key={key} className="card m-2">
                        <div className="card-body row d-flex" style={{ padding:"10px"}}>
                          {/* thumbnail */}
                          <div className="col-2">
                            {offer.loading?
                            <div className="d-flex justify-content-center" style={{ height:"100px", width:"100px",}}>
                              <div className="spinner-border text-primary  align-self-center" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div> :
                            <div>
                              <a onClick={this.handleTxClick} style={{ cursor:"pointer" }}>
                              <img className="border-3 rounded"   id={offer.txID  }
                                style={{height:"100px", width:"100px",objectFit:"cover"}} src={offer.imgSrc}/>
                              </a>
                            </div> }
                          </div>
                          {/* contract short info */}
                          <div className="col-6">
                            <p style={{marginBottom:"0"}}>Contract Address:</p>
                            <a onClick={this.handleTxClick} style={{ cursor:"pointer" }}>
                            <p className="text-info text-truncate mb-0" id={offer.txID  }>{offer.contractAddress}</p></a>
                            <p style={{marginBottom:"0"}}>Owner: </p>
                            <p className="text-secondary text-truncate  mb-0">{offer.imageOwner}</p>
                          </div>
                          {/* details */}
                          <div className="col-4">
                            <div className="m-2 d-flex justify-content-end">
                              {badge}
                              <button className="btn btn-info mx-1"  id={offer.txID}
                                onClick={this.handleTxClick}>See Detail</button>
                            </div>
                            <div className="m-2 d-flex justify-content-end align-items-end flex-column">
                              <small className="">Launch time: {moment(offer.launchTime).format("YYYY-MM-DD HH:mm:ss")}</small>
                              <small className="text-danger">End time: {moment(offer.endTime).format("YYYY-MM-DD HH:mm:ss")}</small>      
                            </div>
                          </div>
                        </div>
                      </div>
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