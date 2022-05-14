import React from 'react'
import { Container } from 'react-bootstrap'
import Footer from '../components/Footer'
import Modals from "../components/Modals";
import { getTxByID,getPrevOwner } from '../http/purchase'
import { getThumbnail } from '../http/image'
import { web3Context } from "../context/web3Context";

const moment = require('moment')
class Transaction extends React.Component {

  static contextType = web3Context;
  constructor(props){
    super(props)
    this.state = {
      account:'',
      tx:'',
      image:'',
      prevOwner:[],
      imgSrc:'',
      loadImage: true,
    }
  }

  componentDidMount = () => {
    const account = this.context.account
    console.log(this.context.account)

    this.setState({account})
    let id = this.props.match.params.txID
    console.log(id)
    getTxByID({txID:id}).then((res)=>{
      let data = res.data
      let ptx = res.data.ptx
      console.log(data)
      const web3 = this.context.web3
      let pos = Number(ptx.offer)-Number(ptx.authorShare)-Number(ptx.ownerShare)
      ptx.offer = web3.utils.fromWei(ptx.offer)
      ptx.authorShare = web3.utils.fromWei(ptx.authorShare)
      ptx.ownerShare = web3.utils.fromWei(ptx.ownerShare)
      ptx.prevOwnerShare = web3.utils.fromWei(pos.toString())
      this.setState({tx:data.ptx});
      this.setState({image:data.image})
      getPrevOwner({sha3:data.image.sha3}).then(res=>{
        let polist = res.data
        const potb=[0.05,0.09,0.12,0.14,0.15]
        this.setState({prevOwner: polist})
        this.setState({prevOwnerPercent:potb[polist.length-1]})
      })
      this.handleImageSrc(data.image.thumbnailPath)
    })
  }

  handleImageSrc = (path) => {
    let formData = new FormData()
    formData.append("path", path)
    getThumbnail( formData ).then((res) => {
      let blob  = new Blob([res])
      let url = URL.createObjectURL(blob);
      this.setState({imgSrc:url})
      this.setState({loadImage:false})
    })
  }

  handleImageClick = () => {
    console.log(this.state.account)
    const imageID = this.state.image.imageID
    this.props.history.push({pathname:"/detail/"+imageID})
  }

  handleConfirm = () => {
    console.log("confirming")
  }

  handleDecline = () => {
    console.log("declining")
  }

  handleCancel = () => {
    console.log("cancelling")
  }

  handleSign = () => {
    console.log("signing")
  }

  render() {

    return(
      <main>
        <Modals confirmModal="confirmModal" declineModal="declineModal" 
                cancelModal="cancelModal" signModal="signModal"
                onTx = {this.state.tx} onIdx = {this.state.onIdx}
                handleConfirm={this.handleConfirm} handleDecline={this.handleDecline}
                handleCancel={this.handleCancel}  handleSign={this.handleSign} 
          />
      <Container>
        <main style={{ marginTop: "60px"}}>
          <div className="text-center py-3 ">
            <h2>Transaction Details</h2>
            <hr></hr>
          </div>
          <div className='row'>
            <div className='col-6'>
              <div className='border rounded'>               
                <h4 className="text-center py-2" >Contract Info</h4>  
                <h5 className="mx-3">Contract Address</h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.contractAddress}</p>
                <h5 className="mx-3">Image ID</h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageID}</p>
                <h5 className="mx-3">Purchaser &nbsp; { this.context.account.toLowerCase() == this.state.tx.purchaser?
                <span class="badge bg-primary">me</span>:<span></span>}</h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.purchaser}</p>
                <h5 className="mx-3">Image Owner &nbsp;
                { this.context.account.toLowerCase() == this.state.tx.imageOwner?
                <span class="badge bg-primary">me</span>:<span></span>}</h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageOwner}</p>
                <h5 className="mx-3">Image Author &nbsp; 
                { this.context.account.toLowerCase() == this.state.tx.imageAuthor?
                <span class="badge bg-primary">me</span>:<span></span>}</h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{this.state.tx.imageAuthor}</p>
                <h5 className="mx-3">Offer</h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{Number(this.state.tx.offer).toFixed(6)} ETH</p>
                <h5 className="mx-3">Contract Address</h5>
                <p className="mx-2 bg-light border rounded text-center text-truncate">{moment(this.state.tx.endTime).format("YYYY-MM-DD HH:mm:ss")}</p>
                <a class="btn btn-link" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#collapseprevOwner" aria-expanded="false" aria-controls="collapseprevOwner">
                    Previous Owners?
                </a>
                <div className="collapse " id="collapseprevOwner">
                  {this.state.prevOwner.length==0?
                  <h6 className="mx-3" style={{color:"#00CED1"}}>No previous owner</h6>
                  :this.state.prevOwner.map((po,index)=>{
                      return(
                        <div>
                          <h6 className="mx-3" style={{color:"#00CED1"}}>Previous Owner #{index+1}</h6>
                          <p className="mx-2 bg-light border rounded text-center text-truncate">{po}</p>    
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
            <div className='col-6'>
              <div className='border rounded' >
                <h4 className="text-center py-2">Operations</h4>  
                <div className=' d-flex justify-content-center  mb-3'>

                  <button className="btn btn-success mx-1"  id={this.state.tx.txID}
                    data-bs-toggle="modal" data-bs-target="#confirmModal"
                    onClick={this.handleTxClick}>See Detail</button>
                </div>
              </div>
              <div className='border rounded mt-3' >
                <h4 className="text-center py-2">Preview</h4>  
                {this.state.loadImage?
                    <div class="d-flex justify-content-center mb-3">
                      <div class="spinner-border text-primary  align-self-center" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    :<div className='text-center'>
                      <a onClick={this.handleImageClick} style={{ padding:"auto",cursor:"pointer" }}>
                        <img className="border-3 rounded"
                          style={{maxHeight:"400px", width:"100%",objectFit:"cover"}} src={this.state.imgSrc}/>
                      </a>
                      <h5 className='py-1'>"{this.state.image.title}"</h5>
                    </div>
                    }
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </Container>
      </main>
    )
  }
}

export default Transaction;
