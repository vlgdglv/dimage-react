import React from "react";
import AccountInfo from "../../components/AccountInfo";

// const Overview = () => <h1 style={{ paddingTop:"150px" }}>Profile Overview</h1>;
class Overview extends React.Component{
  constructor(props) {
    super(props)
  }
  render() {
    return(
      <main className="d-flex justify-content-end" style={{ paddingTop:"56px" }}>
        <div className="col-md-5 m-auto">
          <AccountInfo account={this.props.account} balance={this.props.balance}/>
        </div>
      </main>
    )
  }
}

export default Overview;