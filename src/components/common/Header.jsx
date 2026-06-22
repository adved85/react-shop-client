import React from 'react';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';

// header - icons
import Profile from '../../assets/images/icons/profile.svg?react';
import Cart from '../../assets/images/icons/cart.svg?react';
import { svgSizes } from '../../constants';

const Header = () => {
    return (
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
                            style={{ maxHeight: '150px' }}
                            navbarScroll
                        >
                            <Nav.Link href="#action1">Mens</Nav.Link>
                            <Nav.Link href="#action2">Womans</Nav.Link>
                            <Nav.Link href="#action2">Kids</Nav.Link>
                        </Nav>
                        <div className="nav-right">

                            <a href="" className='ms-3'>
                                <Profile style={svgSizes} />
                            </a>
                            <Link to="/cart" className="ms-3">
                                <Cart style={svgSizes} />
                            </Link>
                        </div>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        </header>
    )
}

export default Header
