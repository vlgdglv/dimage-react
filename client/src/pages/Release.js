import React from "react";
import { Container, Form } from "react-bootstrap";
//web3
import { web3Context } from '../context/web3Context';
import Web3 from 'web3'
//abis
import ContractRelease from '../abis/Release.json'
// import {Router, useHistory } from 'react-router-dom';
// const Release = () => <h1 style={{ paddingTop:"150px" }}>Releasing</h1>;
//http
import { releaseImage, uploadImage,getImageBySHA } from "../http/release";
//components
import Footer from "../components/Footer";
import AccountInfo from "../components/AccountInfo";
import MyAlert from "../components/MyAlert";
import {compressors} from "glize/index"

const watermark = require('watermarkjs')
const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
});

class Release extends React.Component{
  
  static contextType = web3Context;

  constructor(props){
    super(props);
    this.state = {
      imgID:0,
      image:null,
      buffer: null,
      imgFile: null,
      sha3:'',
      sign:'',
      ipfsHash:'',
      imgTitle:'',
      account: '',
      balance: '',
      web3:null,
      release: null,

      loading:false,
      show:false,
      type:'',
      message:'',
    }
  }

  componentDidMount() {
    this.loadBlockchainData().then(()=>{
      console.log("block chain data loaded")
      this.state.release.methods.imageCount().call().then((tmpImgID)=>{
        this.setState({ imgID: parseInt(tmpImgID)+1 }) 
        console.log(this.state.imgID)
      })
    })

    let account = this.context.account
    this.setState({account})
    let web3 = this.context.web3
    this.setState({web3})

    web3.eth.getBalance(account).then((balance)=>{
      this.setState({balance: web3.utils.fromWei(balance)})
      console.log("[update]"+balance)
    })
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
 
  async encodeImage  (data) {
    await new Promise(resolve => {
      compressors.compress(data)
    }).then((res)=> {
      console.log(res)
    })
  } 
  
  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (file === null || file === '' || file === undefined) {
      return;
    }
    this.setState({imgFile: file})
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
      // this.encodeImage(data)
      this.uploadThumbnail(this.state.imgFile,sha3).then((res)=>{
        if (res.success) {
          this.setState({thumbnailPath:res.data.thumbnailPath})
        }else {
          this.popAlert("danger","fail to save thumbnail, please try again")
        }
      })
      .catch((err)=>{ 
        this.setState({loading: false})
        this.popAlert("danger", err)
      })
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
    this.setState({loading: true})
    console.log("imageID=" + this.state.imgID)

    const author = this.state.account

    web3.eth.sign(this.state.sha3, author)
    .then((result)=>{
      console.log(result)
      this.setState({sign:result})

      ipfs.add(this.state.buffer).then((ipfsHash, error) => {
        console.log("ipfs hash = " + ipfsHash.path)
        if (error) {
          console.error(error)
          return
        }
        this.setState({ipfsHash:ipfsHash.path})

        const hash = ipfsHash.path; 
        const imgID = this.state.imgID;
        const sha3 = this.state.sha3;
        const sign = this.state.sign;
        const title = this.state.imgTitle
        const imageData = {
          imgID:        imgID,
          author:       this.state.account,
          sha3:         this.state.sha3,
          signature:    this.state.sign,
          title:        title,
          thumbnailPath:this.state.thumbnailPath
        } 
        this.state.release.methods.uploadImage(hash, sha3, sign)
        .send({from: author})
        .then((res) => {
          // console.log(res)
          if (res.status) { //block chain success
            releaseImage(imageData).then((res)=>{
              console.log(res)
              this.setState({loading: false})
              if (res.success) {
                this.setState({imgID : this.state.imgID+1})
                this.popAlert("success", "Release successfully! You can check it in your Profile/Creation page")
              }else {
                this.popAlert("danger", res.message)
              }
            }).catch((error) => {
              console.error(error)
              this.setState({loading: false})
              this.popAlert("danger","Internal Server Error")
            })
          }else {
            this.setState({loading: false})
            this.popAlert("danger","something wrong with blockchain")
          }
        })
        .catch((err) => {
          this.setState({loading: false})
          this.popAlert("danger",err.message)
        })

      })

    }) 
    .catch((err)=>{ 
      this.setState({loading: false})
      this.popAlert("danger", err.message)
    })
  }
  
  uploadThumbnail = (image, sha3) => {
    console.log(image)
    const wmText = '@' + this.state.account;
    //generate watermark
    return watermark([image])
    .blob(watermark.text.lowerRight(wmText, '80px Josefin Slab', '#000',0.6))
    .render()
    .blob(watermark.text.upperLeft(wmText, '80px Josefin Slab', '#fff',0.6,80))
    .then((img) => {
      // console.log(img)
      const imgFile = new File([img], image.name)
      const formData = new FormData()
      formData.append("file", imgFile)
      formData.append("sha3", sha3)
      return uploadImage(formData, true)
    }).catch((err) => {
      this.setState({loading: false})
      this.popAlert("danger", err)
    })
  }

  popAlert = (type,message) => {
    this.setState({type})
    this.setState({message})
    this.setState({show:true})
  }

  closeAlert = () => { 
    this.setState({show:false})
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
              <AccountInfo account={this.state.account} balance={this.state.balance}/>
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
                      type="file" id="imageFile" required
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
                    maxLength="200"
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
              <div style={{ marginTop:"20px"}}>
              {
                
                  this.state.loading ?
                  <div class="d-flex align-items-center justify-content-center">
                    <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
                    <div className="mx-1 text-primary">
                      <strong >Continue your operation in MetaMask...</strong>
                    </div>
                  </div>
                  :
                  <MyAlert 
                    show={this.state.show} 
                    message={this.state.message} 
                    type={this.state.type}
                    closeAlert={this.closeAlert}/> 
                }
              </div>
            </div>
          </div>
        </main>
        <Footer/>
      </Container>
    )
  }
}

export default Release;