import React from "react";
import { Container } from "react-bootstrap";

import  MyPagination  from '../components/MyPagination'
import Album from "../components/Album";

const requireContext = require.context("../pics", true, /^\.\/.*\.png$/);
const testImages = requireContext.keys().map(requireContext);
const moment = require('moment')

class Home extends React.Component{
  
  constructor(props){
    super(props)
    this.state = {
      images: [],
      totPages:3,
      currentPage: 1,
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

  }
  handlePageChange = (ele) => {
    console.log(ele)
    let images = testImages.slice((ele-1)*15, ele*15)
    images = images.map((image, index) => {
      return{
        key:index,
        image:image,
        title:index.toString(),
        date: moment().format("YYYY-MM-DD HH:mm:ss")
      }
    })
    this.setState({images})
    this.setState({currentPage:ele})
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
          <div className="text-center py-2">
            <h3>Market Place</h3>
          </div>
          <Album 
            images={this.state.images}
            totPages={this.state.totPages}
            currentPage={this.state.currentPage}
            afterPageClicked={this.handlePageChange}
          />
        </div>
      </main>
    )
  }
}

export default Home;