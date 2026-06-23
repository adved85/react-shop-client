import React, { useState } from 'react';
import Layout from './common/Layout';

import { Link } from 'react-router-dom';
import ProductImgSix from '../assets/images/Mens/six.jpg';
import Trash from '../assets/images/icons/trash.svg';

const Checkout = () => {
    const [selectedMethod, setSelectedMethod] = useState('cod');

    const handleRadioChange = (event) => {
        setSelectedMethod(event.target.value);
        // console.log('Selected:', event.target.value);
    };

    return (
        <Layout>
            <div className="container checkout-page">
                <div className="row">
                    <div className="col-md-12">

                        <nav aria-label="breadcrumb" className='pt-4'>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Checkout</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-7">
                        <h3 className='border-bottom pb-3'>
                            <strong>Billing Details</strong>
                        </h3>
                        <form action="">
                            <div className="row my-3">
                                <div className="col">
                                    <input type="text" className='form-control' name='name' placeholder='Name' />
                                </div>
                                <div className="col">
                                    <input type="text" className='form-control' name='email' placeholder='Email' />
                                </div>
                            </div>
                            
                            <div className="row my-3">
                                <div className="col">
                                    <textarea className="form-control" rows="3" id="comment" name="address" placeholder='Address'></textarea>
                                </div>
                            </div>

                            <div className="row my-3">
                                <div className="col">
                                    <input type="text" className='form-control' name='city' placeholder='City' />
                                </div>
                                <div className="col">
                                    <input type="text" className='form-control' name='state' placeholder='State' />
                                </div>
                            </div>

                            <div className="row my-3">
                                <div className="col">
                                    <input type="text" className='form-control' name='zip' placeholder='Zip' />
                                </div>
                                <div className="col">
                                    <input type="text" className='form-control' name='mobile' placeholder='Mobile' />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="col-md-5">
                        <h3 className='border-bottom pb-3'>Items</h3>

                        <table className='table'>
                            <tbody>
                                <tr>
                                    <td>
                                        <img src={ProductImgSix} alt="" width={50}/>
                                    </td>
                                    <td valign='middle'>
                                        <h4>Dummy Product Title</h4>
                                        <div className="d-flex align-items-center">
                                            <span className='me-3'>$18</span>
                                            <button className='btn btn-size'>S</button>
                                            <span className='ps-5'>X 1</span>                                     
                                        </div>                                    
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <img src={ProductImgSix} alt="" width={50}/>
                                    </td>
                                    <td valign='middle'>
                                        <h4>Dummy Product Title</h4>
                                        <div className="d-flex align-items-center">
                                            <span className='me-3'>$18</span>
                                            <button className='btn btn-size'>S</button>
                                            <span className='ps-5'>X 1</span>                                     
                                        </div>                                    
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="row justify-content-end">
                            <div className="col-md-12">
                                <table className='table'>
                                    <tbody>
                                        <tr>
                                            <td>Subtotal:</td>
                                            <td align='right'>$123</td>
                                        </tr>
                                        <tr>
                                            <td>Shipping:</td>
                                            <td align='right'>$1.5</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Grand Total:</strong></td>
                                            <td align='right'>$124.5</td>
                                        </tr>                           
                                    </tbody>
                                    <tfoot>
                                        <tr >
                                            <td className='border-0'>
                                                <h3 className='py-3'>Payment Methods</h3>
                                                <div className="d-flex">
                                                    <div className="form-check">
                                                        <input 
                                                            type="radio" 
                                                            className="form-check-input" 
                                                            name="method" 
                                                            value="stripe" 
                                                            id='r1'
                                                            checked={selectedMethod === 'stripe'}
                                                            onChange={handleRadioChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="r1">Stripe</label>
                                                    </div>

                                                    <div className="form-check ms-4">
                                                        <input 
                                                            type="radio" 
                                                            className="form-check-input" 
                                                            name="method" 
                                                            value="cod" 
                                                            id='r2'
                                                            checked={selectedMethod === 'cod'}
                                                            onChange={handleRadioChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="r2">COD</label>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className='border-0'>
                                                <div className="d-flex justify-content-start">
                                                    <button className='btn btn-primary my-2'>Pay Now</button>
                                                </div>
                                            </td>
                                        </tr>  
                                    </tfoot>
                                </table>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Checkout
