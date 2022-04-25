import React from "react";
import { Card, Container } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";

import AccountInfo from "../components/AccountInfo";

//web3
import { web3Context } from '../context/web3Context';
//Footer
import Footer from "../components/Footer";


const requireContext = require.context("../pics", true, /^\.\/.*\.png$/);
const testImages = requireContext.keys().map(requireContext);

class Purchase extends React.Component{
  
  static contextType = web3Context;

  constructor(props) {
    super(props)
    this.state = {
      image:''
    }
  }

  componentDidMount = () => {
    const idx = Math.floor(Math.random() * 43)
    const img = testImages[idx]
    console.log(idx)
    const image = {
      account: '',
      web3: null,
      balance:'',
      imgID: 0,
      image: img,
      title: "there is no title",
      author: "0x40651eEDCE5812ae0263BecAC7B179716925c041",
      owner: "0x40651eEDCE5812ae0263BecAC7B179716925c041"
    }
    console.log(this.props.match.params.imgID)
    this.setState({imgID: this.props.match.params.imgID})
    this.setState({image: image })
    // console.log(this.state.image)  
    const account = this.context.account
    this.setState({account})
    const web3 = this.context.web3
    this.setState({web3})
    // let balance = this.context.balance
    // this.setState({balance})
    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
      console.log("[update]"+balance)
    })
    
    window.ethereum.on('accountsChanged', (account) => {
      console.log("[release]change account:"+account)
      account = account.toString()
      if (account === '') {
        this.props.history.push('/error')
      }
      this.setState({account})
      web3.eth.getBalance(account).then((balance)=>{
        this.setState({balance: web3.utils.fromWei(balance)})
        console.log("[update]"+balance)
      })
    });
  }

  render() {
    return (
      <Container>
        <main style={{ marginTop: "56px"}}>
          <div className="text-center py-3 ">
            <h2>Purchasing</h2>
            <hr></hr>
          </div>
          <Card className="mb-4">
            <CardHeader > 
            <div className="d-flex column">
              <h4 className="text-truncate align-middle" style={{maxWidth:"50%", marginBottom:"0"}}>{this.state.image.title}</h4>
            </div>
            </CardHeader>
            <img className="img-responsive center-block rounded" 
              src= {this.state.image.image }
              alt="No Thumbnail"
              style={{ maxWidth:"100%" }}
            />
          </Card>
          <hr></hr>
          <div className="row g-4">
            <div className="col-md-6 col-lg-6 ">
              <div className="border rounded  my-5" style={{ marginBottom:"auto" }}>  
                  <h5 className="my-3 text-center" style={{ color:"#008B45"}}>Author &amp; Owner</h5>
                  <h5 className="mx-3">Author</h5>
                  <p className="mx-3 bg-light border rounded text-center text-truncate">{this.state.image.author}</p>
                  <h5 className="mx-3">Owner</h5>
                  <p className="mx-3 bg-light border rounded text-center text-truncate">{this.state.image.owner}</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-6">
              <AccountInfo account={this.state.account} balance={this.state.balance}/>
            </div>
          
          </div>
          <div className="row g-4">
            <div className="col-md-7 col-lg-7 ">
            <h4 className="mb-3">Buy this!</h4>
            <form>
              <div className="row g-5">
                <div class="col-12">
                  <div className="row g-3">
                    <div className="col-sm-10" style={{ paddingTop:"0"}}>
                      <input type="number" id="imageTipAmount"
                          min="0" max="99" step="0.000001"
                          className="form-control rounded"
                          required placeholder="input your offer"
                      /> 
                    </div>
                    <div className="col-sm-2 " style={{ display:"inline-block",verticalAlign:"middle" }}>
                      <h5 className="py-2">Ξ ETH</h5>
                    </div>
                  </div>
                </div>
              </div>
              <hr style={{ width:"95%"}} ></hr>
              <div style={{ textAlign:"center" }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ width:"50%", height:"50px"}}
                    >Confirm</button>
                </div>
            </form>
            </div>
            <div className="col-md-5 col-lg-5">
              <div className="my-2">  
                <h5 className="my-3">Tips:</h5>
                <p>1. 10% of your bid gives to the original author as bonus.</p>
                <p>2. Contract deploy fee is low, enjoy it!</p>
                <p>3. You can track trade progress in your Profile/Trade page.</p>
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