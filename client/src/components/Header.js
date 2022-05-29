import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

class Header extends React.Component {

  render() {
    return (
      <Navbar className="fixed-top shadow bg-dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">
            <button  type="button" className="btn btn-dark   position-relative">
              <strong>Dimage</strong>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                beta<span className="visually-hidden">unread messages</span>
              </span>
            </button>
          </Navbar.Brand>
          <Nav>
            <Nav.Link className='nav-link' href="/">Home</Nav.Link>
            <Nav.Link className='nav-link' href="/release">Release</Nav.Link>
            <Nav.Link className='nav-link' href="/trades">Trades</Nav.Link>
            <Nav.Link className='nav-link' href="/profile">Profile</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      );
  };
}

export default Header;