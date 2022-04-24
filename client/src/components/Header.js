import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

import Web3 from 'web3';

class Header extends React.Component {

  state = {web3: null, account: '', balance: ''}

  // constructor(props) {
  //   super(props)
  // } 

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-ethereum browser detected. You should try MetaMask')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const balance = await web3.eth.getBalance(accounts[0])
    this.setState({ balance: web3.utils.fromWei(balance) })
  }


  handleClick = () => {
    console.log("getting web3");
    this.loadWeb3()
    this.loadBlockchainData();
    console.log(this.state.account)
  }

  render() {
    return (
      <Navbar className="fixed-top shadow bg-dark" variant="dark">
        <Container>
          <Navbar.Brand href="https://www.bilibili.com/">
            <strong>Dimage</strong>
          </Navbar.Brand>
          <Nav>
            <Nav.Link className='nav-link' href="/">Home</Nav.Link>
            <Nav.Link className='nav-link' href="/release">Release</Nav.Link>
            <Nav.Link className='nav-link' href="/profile/nmsl">Profile</Nav.Link>
            {/* {
              this.state.account == null ?
              <Button className='btn-light btn-sm' onClick={this.handleClick}>get Web3</Button>
              :<NavbarBrand>web3 done</NavbarBrand>
            } */}
          </Nav>
        </Container>
      </Navbar>
      );
  };
}

export default Header;