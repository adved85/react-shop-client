import React from 'react';

import LogoWhite from '../../assets/images/logo-white.png';
// footer icons
import Truck from '../../assets/images/icons/truck.svg?react';
import Cash from '../../assets/images/icons/cash.svg?react';
import CreditBack from '../../assets/images/icons/credit-card-2-back.svg?react';
import { svgSizes } from '../../constants';

const Footer = () => {
    return (
        <footer className='py-5 text-white'>
            <div className="container">

                {/* row-1 with h2 */}
                <div className="row mb-3">
                    <div className="col-md-3">
                        <img src={LogoWhite} alt="" width={150} />
                        <div className="py-3 pe-5">
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                        </div>
                    </div>
                    <div className="col-md-3">
                        <h2 className='mb-3'>Categories</h2>
                        <ul>
                            <li><a href="">Kids</a></li>
                            <li><a href="">Men</a></li>
                            <li><a href="">Women</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h2 className='mb-3'>Quick Links</h2>
                        <ul>
                            <li><a href="">Login</a></li>
                            <li><a href="">Register</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h2 className='mb-3'>Get in Touch</h2>
                        <ul>
                            <li><a href="">+33-56-XX-XX</a></li>
                            <li><a href="">info@pure.wear@com</a></li>
                        </ul>
                    </div>
                </div>

                {/* row-2 with h3 */}
                <div className="row spotlight py-3">
                    <div className="col-md-4">
                        <div className="d-flex justify-content-center">
                            <Truck style={svgSizes} />
                            <h3 className='ps-2'>Free Delivery</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="d-flex justify-content-center">
                            <CreditBack style={svgSizes} />
                            <h3 className='ps-2'>Money Back Guarantee</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="d-flex justify-content-center">
                            <Cash style={svgSizes} />
                            <h3 className='ps-2'>Secure Payments</h3>
                        </div>
                    </div>
                </div>

                {/* row-3 */}
                <div className="row">
                    <div className="col-md-12">
                        <p className='text-center pt-5'>
                            &copy 2026 All Rights Reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
