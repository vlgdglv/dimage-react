import React from "react";

import Footer from "../components/Footer";

import Creation from './profile/Creation';
import Overview from './profile/Overview';
import Possession from './profile/Possession';
import Trades from './Trades';
//web3
import { web3Context } from '../context/web3Context';
//
require('bootstrap')

class Profile extends React.Component {

  static contextType = web3Context;
  
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      balance: '',
      web3:null,
    }
  }

  componentDidMount = () => { 
    const account = this.context.account
    this.setState({account})
    const web3 = this.context.web3
    this.setState({web3})
    // let balance = this.context.balance
    // this.setState({balance})
    console.log(web3)
    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
      console.log("[profile]"+balance)
    })
    
    window.ethereum.on('accountsChanged', (account) => {
      console.log("[profile]change account:"+account)
      account = account.toString()
      if (account === '') {
        this.props.history.push('/error')
      }
      this.setState({account})
      web3.eth.getBalance(account).then((balance)=>{
        this.setState({balance: web3.utils.fromWei(balance)})
        console.log("[profile]"+balance)
      })
    });
  }
  
  render() {
    let id = this.props.match.params.userId;
    return (
    // <div>
    //   <h1 style={{ paddingTop:"150px" }}>User Profile</h1>
    //   <h3>userId: { id }</h3>
    // </div>
    <main className="d-flex ">
      <div className="nav d-flex nav-pills flex-column flex-shrink-0  bg-light" 
        style={{width: "250px", minHeight:"calc(100vh - 50px)", marginTop:"50px"}}
        id="v-pills-tab" role="tablist" aria-orientation="vertical"
        >
        <a href="/profile" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto mt-3 link-dark text-decoration-none">
          <svg className="bi me-2" style={{width:"40", height:"32"}}></svg>
          <span className="fs-4">Me Profile</span>
        </a>
        <hr></hr>
        <div className="nav flex-column nav-pills m-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
          <button className="nav-link link-dark active" id="v-pills-overview-tab" data-bs-toggle="pill" data-bs-target="#v-pills-overview" type="button" role="tab" aria-controls="v-pills-overview" aria-selected="true">Overview</button>
          <button className="nav-link link-dark" id="v-pills-creation-tab" data-bs-toggle="pill" data-bs-target="#v-pills-creation" type="button" role="tab" aria-controls="v-pills-creation" aria-selected="false">Creation</button>
          <button className="nav-link link-dark" id="v-pills-possession-tab" data-bs-toggle="pill" data-bs-target="#v-pills-possession" type="button" role="tab" aria-controls="v-pills-possession" aria-selected="false">Possession</button>
          {/* <button className="nav-link link-dark" id="v-pills-trades-tab" data-bs-toggle="pill" data-bs-target="#v-pills-trades" type="button" role="tab" aria-controls="v-pills-trades" aria-selected="false">Trades</button> */}
        </div>
        </div>
        <div className="tab-content" id="v-pills-tabContent" style={{ minWidth:"calc(100vw - 250px)"}}>
          <div className="tab-pane fade show active" id="v-pills-overview" role="tabpanel" aria-labelledby="v-pills-overview-tab">
            <Overview account={this.state.account} balance={this.state.balance}/>
          </div>
          <div className="tab-pane fade" id="v-pills-creation" role="tabpanel" aria-labelledby="v-pills-creation-tab"><Creation/></div>
          <div className="tab-pane fade" id="v-pills-possession" role="tabpanel" aria-labelledby="v-pills-possession-tab"><Possession/></div>
          {/* <div className="tab-pane fade" id="v-pills-trades" role="tabpanel" aria-labelledby="v-pills-trades-tab"><Trades/></div> */}
        </div>
    </main>    
  )
}  
}

export default Profile;