import React from "react";
import { Container } from "react-bootstrap";
//web3
import { web3Context } from '../context/web3Context';
import Web3 from 'web3'
//abis
import ReleaseContract from '../abis/Release.json'
// import {Router, useHistory } from 'react-router-dom';
// const Release = () => <h1 style={{ paddingTop:"150px" }}>Releasing</h1>;

class Release extends React.Component{
  
  static contextType = web3Context;

  constructor(props){
    super(props);
    this.state = {
      image:null,
      buffer: null,
      sha3:'',
      sign:'',
      imgTitle:'',
      account: '',
      balance: '',
      web3:null,
      release: null,
    }
  }


  componentDidMount() {

    this.loadBlockchainData().then(()=>{
      console.log("block chain data loaded")
    })

    let account = this.context.account
    this.setState({account})
    let web3 = this.context.web3
    this.setState({web3})
    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
      console.log("[update]"+balance)
    })
    
    window.ethereum.on('accountsChanged', (account) => {
      console.log("[release]change account:"+account)
      account = account.toString()
      this.setState({account})
      web3.eth.getBalance(account).then((balance)=>{
        this.setState({balance: web3.utils.fromWei(balance)})
        console.log("[update]"+balance)
      })
    });
    
  }

  async loadBlockchainData() {
    const web3 = this.context.web3
    const networkId = await web3.eth.net.getId()
    const releaseNetworkData = ReleaseContract.networks[networkId]
    if (releaseNetworkData) {
      const release = new web3.eth.Contract(ReleaseContract.abi, releaseNetworkData.address)
      this.setState({ release })
      console.log(release)
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const bufferReader = new window.FileReader()
    const dataURLReader = new window.FileReader()
    bufferReader.readAsArrayBuffer(file)
    bufferReader.onloadend = () => {
      let data = Buffer(bufferReader.result).toString()
      // console.log(data)
      this.setState({ buffer: Buffer(bufferReader.result) })
      //keccak-256
      const sha3 = Web3.utils.sha3(Buffer(bufferReader.result)) 
      this.setState({sha3})
    }
    dataURLReader.readAsDataURL(file)
    dataURLReader.onload = () => {
      this.setState({image: dataURLReader.result})
    }
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const web3 = this.context.web3
    this.setState({imgTitle: this.imgTitle.value})
    web3.eth.sign(this.state.sha3, this.state.account).then((result)=>{
      console.log(result)
      this.setState({sign:result})
    }).then(() =>{
      const hash = "hash";
      const sha3 = this.state.sha3;
      const sign = this.state.sign;
      const title = this.state.imgTitle;
      this.state.release.methods
      .uploadImage(hash, sha3, sign, title)
      .send({from: this.state.account})
      .on('transactionHash', (txHash) => {
        console.log(txHash)
      })
    })
  }
  render(){
    return(
      // <h1 style={{ paddingTop:"150px" }}>Releasing</h1>
      <Container>
        <main>
          <div className="text-center py-5">
            <h2 style={{ paddingTop:"80px" }}>Release your work!</h2>
          </div>
          <div className="row g-5 ">
            <div className="col-md-5 col-lg-5 order-md-last" style={{ padding:"auto"  }}>
              <div className="border rounded  my-5" style={{ marginBottom:"auto" }}>  
                <h5 className="my-3 text-center" style={{ color:"#008B45"}}>Account Information</h5>
                <h5 className="mx-3">Address</h5>
                <p className="mx-3 bg-light border rounded text-center text-truncate">{this.state.account}</p>
                <h5 className="mx-3">Balance</h5>
                <p className="mx-3 bg-light border rounded text-center text-truncate">{this.state.balance} ETH</p>
              </div>
              <div className="my-2">  
                <h5 className="my-3">Tips:</h5>
                <p>1<span role="img">⬆️</span>Upload your image and name a title</p>
                <p>2<span role="img">🔑</span>Sign your image with your account</p>
                <p>3<span role="img">✅</span>Confirm transaction</p>
              </div>
            </div>
            
            <div className="col-md-7 col-lg-7  bg-ligth">          
              <form onSubmit={this.handleSubmit}>
                <div className="col-12 ">
                  <h5 className="my-3">Upload your work</h5>
                  <div style={{ textAlign:"center"}}>
                    <input className="form-control-file"
                      type="file" id="imageUpload" 
                      accept=".jpgm, .jpeg, .png, .bpm, .gif, .jpg"
                      onChange={this.captureFile}/>
                  </div>
                </div>
                <hr className="my-3"></hr>
                {
                  this.state.buffer ?
                  <div className="col-12">
                    <h5 className="my-3">Preview</h5>
                    <img className="img-responsive rounded" src={this.state.image} style={{ maxWidth:"100%"}}/>
                    <hr className="my-3"></hr>
                    <h5 className="my-3">SHA3(Keccak-256)</h5>
                    <p className="mx-3 bg-light border rounded text-center text-truncate">{this.state.sha3}</p>
                    <hr className="my-3"></hr>
                  </div>
                  :<p></p>
                }
                <div className="col-12" >
                  <h5 className="my-3">Title</h5>
                  <input
                    id="imageTitle"
                    type="text"
                    className="form-control"
                    placeholder="Image title..."
                    ref={(input) => {this.imgTitle = input}}
                    required />
                </div>
                <hr className="my-3"></hr>
                <div style={{ textAlign:"center" }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width:"50%", height:"50px"}}
                  >Upload!</button>
                </div>
              </form>
            </div>
            
          </div>
        </main>
      </Container>
    )
  }
}


export default Release;