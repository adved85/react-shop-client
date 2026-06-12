import React from 'react'

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Logo from '../assets/images/logo.png';

const Home = () => {
  return (
    <>
      {/* <h1>Home Page</h1> */}
      <header className='shadow'>
        <div className='bg-dark text-center py-3'>
          <span className='text-white'>Your Fashion Pertner</span>
        </div>

        <div className='container'>
          <Navbar expand="lg" className="bg-body-tertiary">
            <Navbar.Brand href="#">
              {/* Navbar scroll */}
              <img src={Logo} alt="Logo" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
              <Nav
                className="ms-auto my-2 my-lg-0"
                style={{ maxHeight: '100px' }}
                navbarScroll
              >
                <Nav.Link href="#action1">Mens</Nav.Link>
                <Nav.Link href="#action2">Womans</Nav.Link>
                <Nav.Link href="#action2">Kids</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </header>
    </>
  )
}

export default Home
