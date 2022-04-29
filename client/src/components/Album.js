import React from "react";
import { Container } from "react-bootstrap";
import { withRouter } from "react-router";

import  MyPagination  from '../components/MyPagination'

class Album extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      images: [],
      totalPage:0,
      currentPage: 0,
    }
  }

  handlePurchase = (event) => {
    event.preventDefault()
    const id = event.target.id
    // console.log(this.props.images[id])
    this.props.history.push({
      pathname: 'purchase',
      id:`${id}`,
    })
  }

  render() {
    return(
      <Container> 
        <MyPagination
          totPages={this.props.totPages}
          currentPage={this.props.currentPage}
          pageClicked={(ele) => {
            this.props.afterPageClicked(ele);
          }}
        >
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          {
            this.props.images.map((image, key) => {
              return (
                <div className="col overflow-hiden rounded" id={key}>
                  <div className="card shadow">
                    <div className="bd-placeholder-img card-img-top " role="img" preserveAspectRatio="xMidYMid slice" focusable="false">
                      <div className="thumbnail">
                        <a style={{ cursor:"pointer" }} key={key}>
                        <img  className="img-responsive rounded" 
                          style={{ width:"100%", height:"300px", objectFit:"cover"}} 
                          src={image.image} 
                          />
                          </a>
                      </div>
                    </div>

                    <div className="card-body">
                      <p className="card-text text-truncate">{image.title}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="btn-group">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-secondary"
                            id={image.imageID}
                            onClick={this.handlePurchase}
                            >Buy</button>
                          <button type="button" className="btn btn-sm btn-outline-secondary">Detail</button>
                        </div>
                        <small className="text-muted text-truncate">{image.date}</small>
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
    )
  }

}

export default withRouter(Album);