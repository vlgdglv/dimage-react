import React from "react";
import { Container } from "react-bootstrap";

const requireContext = require.context("../pics", true, /^\.\/.*\.png$/);
const testImages = requireContext.keys().map(requireContext);
const moment = require('moment')
// const sharp = require('sharp')
// const imageThumbnail = require('image-thumbnail');
const imageOptions = {
  height: 300,
  fit:"cover"
}
// require('../utils/jqthumb')

class Home extends React.Component{
  
  constructor(props){
    super(props)
    this.state = {
      images: [],
    }
  }

  componentDidMount = () => {
    testImages.sort(() => {return Math.random() - 0.5})
    let images = testImages.slice(0,15)
    images = images.map((image, index) => {
      // imageThumbnail(image, imageOptions).then((data) => {
      //   return{
      //     key:index,
      //     image:data,
      //     title:index.toString(),
      //     date: moment().format("YYYY-MM-DD HH:mm:ss")
      //   }
      // })
      return{
        key:index,
        image:image,
        title:index.toString(),
        date: moment().format("YYYY-MM-DD HH:mm:ss")
      }
    })
    this.setState({images})
    console.log(images.length)
    console.log(images[0])
  
  }

  render() {
    return(
      <main style={{ marginTop: "56px"}}>
        <section className="py-5 text-center container">
          <div className="row py-lg-5">
            <div className="col-lg-6 col-md-8 mx-auto">
              <h1 className="fw-light">Dimage</h1>
              <p className="lead text-muted">A decentralized image sharing and trading platform</p>
              <p>
                <a href="#" className="btn btn-primary my-2">Check it out</a>
              </p>
            </div>
          </div>
        </section>

        <div className="album py-5 bg-light">
          <Container style={{ }}> 
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {
              this.state.images.map((image ,keys) => {
                console.log(keys)
                return (
                  <div class="col overflow-hiden rounded">
                    <div class="card shadow">
                      <div class="bd-placeholder-img card-img-top " role="img" preserveAspectRatio="xMidYMid slice" focusable="false">
                        <div className="thumbnail" >
                          <img  className="img-responsive rounded" style={{ maxWidth:"100%", maxHeight:"500" }} src={image.image}/>
                        </div>
                      </div>

                      <div class="card-body">
                        <p class="card-text">{image.title}</p>
                        <div class="d-flex justify-content-between align-items-center">
                          <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
                          </div>
                          <small class="text-muted text-truncate">{image.date}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            }
            </div>
          </Container>
        </div>
      </main>
    )
  }
}

export default Home;