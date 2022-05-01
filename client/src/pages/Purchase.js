import React from "react";
import { Card, Container } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";

import { newPurchase } from "../http/purchase";

import AccountInfo from "../components/AccountInfo";

//web3
import { web3Context } from '../context/web3Context';
import ContractPurchase from '../abis/Purchase.json'
import ContractRelease from "../abis/Release.json";
//Footer
import Footer from "../components/Footer";


const requireContext = require.context("../pics", true, /^\.\/.*\.png$/);
const testImages = requireContext.keys().map(requireContext);

class Purchase extends React.Component{
  
  static contextType = web3Context;

  constructor(props) {
    super(props)
    this.state = {
      netID: 0,
      image: '',
      imageID:3,
      imageAuthor: "0x9aEB35aa6EE18cDe040E3903B6aec935619D75cB",
      imageOwner: "0x9aEB35aa6EE18cDe040E3903B6aec935619D75cB",
    }
  }

  componentDidMount = () => {
    const id = this.props.location.id
    const idx = Math.floor(Math.random() * 43)
    const img = testImages[idx]
    // console.log(id)
    // console.log(idx)
    const image = {
      account: '',
      web3: null,
      balance:'',
      imgID: 0,
      image: img,
      title: "there is no title",
      author: this.state.imageAuthor,
      owner: this.state.imageOwner
    }
    // console.log(this.props.match.params.imgID)
    // this.setState({imgID: this.props.match.params.imgID})
    this.setState({image: image })
    // console.log(this.state.image)  
    const account = this.context.account
    this.setState({account})
    const web3 = this.context.web3
    this.setState({web3})
    // let balance = this.context.balance
    // this.setState({balance})

    // console.log("balance = "+balance)
    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
      console.log("[purchase]"+balance)
    })

    web3.eth.net.getId().then((netID) => {
      this.setState({netID})
      // console.log(netID)
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

  handlePurchaseSumbit = (event) => {
    event.preventDefault()
    const web3 = this.context.web3;
    let offerAmount = this.offerAmount.value

    offerAmount = web3.utils.toWei(offerAmount, 'Ether')

    let contractInstance = new web3.eth.Contract(ContractPurchase.abi,{gasPrice:10000,gasLimit:8000000})
    
    const releaseNetworkData = ContractRelease.networks[this.state.netID]
    const releaseAddress = releaseNetworkData.address
    console.log("release addr = " + releaseAddress)
    const imageID = 2;
    const imageOwner = this.state.imageOwner;
    const imageAuthor = this.state.imageAuthor
    const purchaser = this.state.account;
    const sha3 = "0x30f31556837b6521fe07275e6b6a33801e4eeb33dec9e79344e848ccc24ccc61";

    let address = null;
    contractInstance.deploy({
      data: ContractPurchase.bytecode,
      arguments: [releaseAddress,imageID,purchaser,imageOwner,imageAuthor,3600, sha3],
    }).send({from: purchaser, value:offerAmount })
    .then((newContractInstance) => {
      const address = newContractInstance.options.address
      const contract = new web3.eth.Contract(ContractPurchase.abi, address)
      console.log(address)
      contract.methods.launchTime().call().then((launchTime) => {
        console.log(launchTime)

        let obj = {
          contractAddress: address,
          purchaser: purchaser,
          imageOwner: imageOwner,
          imageAuthor: imageAuthor,
          sha3:sha3,
          imageID:imageID,
          offer: offerAmount,
          launchTime: launchTime,
          duration: 3600
        }
        newPurchase(obj, true).then((res) => {
          if (res.suceess){
            console.log(res.message)
          }
        })
      })
    })
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
            <div className="col-md-6 col-lg-6">
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
            <form onSubmit={this.handlePurchaseSumbit}>
              <div className="row g-5">
                <div class="col-12">
                  <div className="row g-3">
                    <div className="col-sm-10" style={{ paddingTop:"0"}}>
                      <input type="number" id="offerAmount"
                          min="0" max="99" step="0.000001"
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