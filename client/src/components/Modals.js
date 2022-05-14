import React from "react";

class Modals extends React.Component{

  constructor(props){
    super(props)
  }

  render() {
    return(
      <div>
        {/*modal confirm*/}
        <div class="modal fade" id={this.props.confirmModal} data-bs-backdrop="static" data-bs-keyboard="true" 
          tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog"  style={{width:"150%"}}>
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Confirm Transaction!</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div>
                  <div>
                    <span>ImageID : </span>
                    <span className="border rounded">{this.props.onTx.imageID}</span>           
                  </div>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Author:</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.imageAuthor}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Owner (me)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.imageOwner}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Buyer (new owner)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.purchaser}</p>
                  <hr></hr>
                  <div className="d-flex align-items-end flex-column">
                    {/* changes need to be made */}
                    <div>
                    <span>Author's Share : </span>
                    <span style={{ color:"#8B7500",maxWidth:"10px"}}>{Number(this.props.onTx.authorShare).toFixed(6)} ETH</span>
                    </div>
                    <div>
                      <span>Previous owners' reward: </span>
                      <span style={{ color:"#8B7500",maxWidth:"10px"}}>{Number(this.props.onTx.prevOwnerShare).toFixed(6)} ETH</span>
                    </div>
                    <div>
                      <span>Your Share : </span>
                      <span style={{ color:"#8B7500",maxWidth:"10px"}}>{Number(this.props.onTx.ownerShare).toFixed(6)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-success"  
                data-bs-dismiss="modal" id={this.props.onIdx}
                onClick={this.props.handleConfirm}
                >Confirm</button>
              </div>
            </div>
          </div>
        </div>
        {/*modal decline*/}
        <div class="modal fade" id={this.props.declineModal} data-bs-backdrop="static" data-bs-keyboard="true" 
          tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Decline Transaction?</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div>
                  <div>
                    <span>ImageID : </span>
                    <span className="border rounded">{this.props.onTx.imageID}</span>           
                  </div>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Author:</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.imageAuthor}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Owner (me)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.imageOwner}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Buyer (new owner)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.purchaser}</p>
                  <hr></hr>
                  <div className="d-flex align-items-end flex-column">
                    <div>
                    <span>Author's may get : </span>
                    <span style={{ color:"#8B7E66",maxWidth:"10px"}}>{Number(this.props.onTx.authorShare).toFixed(6)} ETH</span>
                    </div>
                    <div>
                      <span>You may get : </span>
                      <span style={{ color:"#8B7E66",maxWidth:"10px"}}>{Number(this.props.onTx.ownerShare).toFixed(6)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-danger"  
                data-bs-dismiss="modal" id={this.props.onIdx}
                onClick={this.props.handleDecline}
                >Decline</button>
              </div>
            </div>
          </div>
        </div>
        {/*modal cancel */}
        <div class="modal fade" id={this.props.cancelModal} data-bs-backdrop="static" data-bs-keyboard="true" 
          tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Cancel Transaction?</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div>
                  <div>
                    <span>ImageID : </span>
                    <span className="border rounded">{this.props.onTx.imageID}</span>           
                  </div>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Author:</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.imageAuthor}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Owner</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.imageOwner}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Buyer (me)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.purchaser}</p>
                  <hr></hr>
                  <div className="d-flex align-items-end flex-column">
                    <div>
                    <span>withdraw your offer : </span>
                    <span style={{ color:"#8B7E66",maxWidth:"10px"}}>{Number(this.props.onTx.offer).toFixed(6)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-danger"
                 data-bs-dismiss="modal" id={this.props.onIdx}
                 onClick={this.props.handleCancel}
                >Still Cancel</button>
              </div>
            </div>
          </div>
        </div>
        {/*modal sign */}
        <div class="modal fade" id={this.props.signModal} data-bs-backdrop="static" data-bs-keyboard="true" 
          tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">One more step! Sign your image</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div>
                  <div>
                    <span>ImageID : </span>
                    <span className="border rounded">{this.props.onTx.imageID}</span>           
                  </div>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Author:</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.imageAuthor}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>Owner (me)</p>
                  <p style={{marginBottom:"0"}} className="text-primary">{this.props.onTx.purchaser}</p>
                  <hr></hr>
                  <p style={{marginBottom:"0"}}>SHA3 </p>
                  <p style={{marginBottom:"0"}} className="text-primary text-break">{this.props.onTx.sha3}</p>
                  
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary"
                 data-bs-dismiss="modal" id={this.props.onIdx}
                 onClick={this.props.handleSign}
                >Sign</button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    )
  }
}

export default Modals