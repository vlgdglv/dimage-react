import React from "react";
//bootstraps
import { Container,Dropdown } from "react-bootstrap";
//components
import MyPagination from "../components/MyPagination";
import Footer from "../components/Footer";
//http
import { getImages, getThumbnail } from "../http/image";
//router
import { withRouter } from "react-router";
//web3
import { web3Context } from '../context/web3Context';
//other requires
const imageAlt = require('../altImage.png')
const moment = require('moment')

class Home extends React.Component{

  static contextType = web3Context; 
  constructor(props){
    super(props)
    this.state = {
      images:  [],
      albumPage:{ totPages:1, currentPage: 1, },
      loading:true,
      order:0,
    }
  }

  componentDidMount = () => { this.loadImages(1,12,this.state.order) }

  async loadImages(curPage, pageCount, order) {
    let images;
    this.setState({loading: true})
    getImages({
      currentPage:curPage,
      pageCount:pageCount,
      order:order
    }).then((res) => {
      console.log(res)
      if (res.success) {
        images = res.data.imageList
        images = images.map((image, index) =>{
          return {
            key:index,
            imageSrc: image.thumbnailPath,
            imageID: image.imageID,
            title:image.title,
            owner:image.owner,
            date:image.releaseTime,
            loading:true
          }
        })
        images.forEach(async image => {
          image.imageSrc = await this.handleImageSrc(image.imageSrc)
          image.loading = false
          this.setState({images})
        })
        //important: do not change following two lines' order, otherwise pagination would fail 
        this.setState({albumPage:{ totPages:res.data.totalPages,currentPage:res.data.currentPage}})
        this.setState({images, loading:false})
      } 
    })
  }
  //get image thumbnail
  async handleImageSrc (path)  {
    let formData = new FormData()
    formData.append("path", path)
    let res = await getThumbnail( formData )
    let blob  = new Blob([res])
    let url = URL.createObjectURL(blob)
    return url 
  }

  handlePageChange = (ele) => {
    this.setState({loading:true, currentPage:ele})
    this.loadImages(ele,12,this.state.order)
  }
  
  handlePurchase = (event) => {
    event.preventDefault()
    const imageID = event.target.id
    this.props.history.push({pathname:"/purchase/"+imageID})
  }

  handleDetail = (event) => {
    event.preventDefault()
    console.log(event.target)
    const imageID = event.target.id
    this.props.history.push({pathname:"/detail/"+imageID})
  }

  render() {
    return(
      <main style={{ marginTop: "56px"}}>
        <section className="py-4 text-center container">
          <div className="row py-lg-5">
            <div className="col-lg-6 col-md-8 mx-auto">
              <h1 className="fw-light">Dimage</h1>
              <p className="lead text-muted">A decentralized image sharing and trading platform</p>
            </div>
          </div>
        </section>
        <div className="py-3 bg-light">
          <Container>
            <div className="d-flex justify-content-between py-2">
              <h2>Market Place!</h2>
              {/* select order */}
              <Dropdown >
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {this.state.order == 0? "Recent release" : "Most popular"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={()=>{
                      this.setState({order:0});
                      this.loadImages(1,12,0)}}>Recent release</Dropdown.Item>
                  <Dropdown.Item onClick={()=>{
                      this.setState({order:1});
                      this.loadImages(1,12,1)}}>Most popular</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Container>
          {this.state.loading?
          <div className="d-flex justify-content-center" >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          :
          <Container> 
            <MyPagination
              totPages={this.state.albumPage.totPages}
              currentPage={this.state.albumPage.currentPage}
              pageClicked={(ele) => {this.handlePageChange(ele);}}
            >
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
              {this.state.images.length == 0  
               ?<h3 className="m-3 text-center border rounded bg-light" style={{width:"97%"}}>Oops! No image at all</h3>
               :this.state.images.map((image, key) => {
                  return (
                    <div className="col overflow-hiden rounded" key={key}>
                      <div className="card shadow">
                        <div className="bd-placeholder-img card-img-top " role="img" preserveAspectRatio="xMidYMid slice" focusable="false">
                          { image.loading ?
                            <div className="d-flex justify-content-center" style={{ width:"100%", height:"300px"}}>
                              <div className="spinner-border text-primary  align-self-center" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>   :
                            <div className="thumbnail">
                              <a style={{ cursor:"pointer" }} key={key}  onClick={this.handleDetail} >
                              <img  className="img-responsive rounded" id={image.imageID}
                                style={{ width:"100%", height:"300px", objectFit:"cover"}} 
                                src={image.imageSrc} alt={imageAlt}/> 
                              </a>
                            </div> }
                        </div>
                        {/* image card */}
                        <div className="card-body">
                          <p className="card-text text-truncate">{image.title}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="btn-group">
                              {image.owner == this.context.account ? 
                              <button type="button" className="btn btn-sm btn-outline-secondary" disabled>Buy</button>
                              : <button 
                                type="button"  id={image.imageID} onClick={this.handlePurchase}
                                className="btn btn-sm btn-outline-secondary">Buy</button>
                              }
                              <button 
                                type="button" id={image.imageID} onClick={this.handleDetail}
                                className="btn btn-sm btn-outline-secondary">Detail</button>
                            </div>
                            <small className="text-muted text-truncate">{moment(image.date).format("YYYY-MM-DD HH:mm:ss")}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
              </div>   
            </MyPagination>
          </Container>
          }
        </div>
        <Footer />
      </main>
    )
  }
}

export default withRouter(Home);