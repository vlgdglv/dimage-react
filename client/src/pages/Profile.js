import React from "react";
//pages
import Creation from './profile/Creation';
import Possession from './profile/Possession';
//web3
import { web3Context } from '../context/web3Context';
import AccountInfo from "../components/AccountInfo";
//others
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
    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
    })
  }
  
  render() {
    return (
      <main className="d-flex ">
        <div className="nav d-flex nav-pills flex-column flex-shrink-0  bg-light" 
          style={{width: "250px", minHeight:"calc(100vh - 50px)", marginTop:"50px"}}
          id="v-pills-tab" role="tablist" aria-orientation="vertical">
          <a href="/profile" 
            className="d-flex align-items-center mb-3 mb-md-0 me-md-auto mt-3 link-dark text-decoration-none">
            <svg className="bi me-2" style={{width:"40", height:"32"}}></svg>
            <span className="fs-4">Me Profile</span>
          </a>
          <hr></hr>
          <div className="nav flex-column nav-pills m-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
            {/* creation tab button */}
            <button className="nav-link link-dark active" id="v-pills-creation-tab" 
              data-bs-toggle="pill" data-bs-target="#v-pills-creation" type="button" 
              role="tab" aria-controls="v-pills-creation" aria-selected="true">Creation</button>
            {/* possession tab button */}
            <button className="nav-link link-dark" id="v-pills-possession-tab" 
              data-bs-toggle="pill" data-bs-target="#v-pills-possession" type="button" 
              role="tab" aria-controls="v-pills-possession" aria-selected="false">Possession</button>
          </div>
          {/* sider account info */}
          <div style={{width: "250px", minHeight:"calc(100vh - 50px)", padding:"10px", paddingTop:"30px"}}>
            <AccountInfo account={this.state.account} balance={this.state.balance}/>
          </div>
        </div>
        
        <div className="tab-content" id="v-pills-tabContent" style={{ width:"calc(100vw - 250px)"}}>
          {/* creation tab */}
          <div className="tab-pane fade show active" id="v-pills-creation" 
            role="tabpanel" aria-labelledby="v-pills-creation-tab">
              <Creation account={this.state.account} />
          </div>
          {/* possession tab */}
          <div className="tab-pane fade" id="v-pills-possession" 
            role="tabpanel" aria-labelledby="v-pills-possession-tab">
              <Possession account={this.state.account}/>
            </div>
        </div>
      </main>    
    )
  }  
}

export default Profile;