import React from 'react';

import Layout from './common/Layout';
import { Link, useNavigate } from 'react-router-dom';

import ProductImgSix from '../assets/images/Mens/six.jpg';
import Trash from '../assets/images/icons/trash.svg';

const Cart = () => {

    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    }; 

  return (
    <Layout>
        <div className="container cart-page">
            <div className="row">
                <div className="col-md-12">

                    <nav aria-label="breadcrumb" className='pt-4'>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">Cart</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <h2 className='border-bottom pb-3'>Cart</h2>

                    <table className='table'>
                        <tbody>
                            <tr>
                                <td>
                                    <img src={ProductImgSix} alt="" width={100}/>
                                </td>
                                <td valign='middle'>
                                    <h4>Dummy Product Title</h4>
                                    <div className="d-flex align-items-center">
                                        <span className='me-3'>$18</span>
                                        <button className='btn btn-size'>S</button>                                        
                                    </div>                                    
                                </td>
                                <td valign='middle'>
                                    <div className='pix-100'>
                                        <input type="number" className="form-control" defaultValue={1}/>
                                    </div>
                                </td>

                                <td valign='middle'>
                                    <span className='qty-price'>$18</span>
                                </td>
                                <td valign='middle'>
                                    <div className="control-buttons">
                                        <button className='btn'>
                                            <img src={Trash} alt="" />                                            
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* flex-column align-items-end */}
            <div className="row justify-content-end">
                <div className="col-md-3">
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
                            <tr>
                                <td colSpan={2} className='border-0'>
                                    <div className="d-flex justify-content-end">
                                        <button 
                                            className='btn btn-primary my-2' 
                                            onClick={handleCheckout}
                                        >
                                            Proceed to checkout
                                        </button>
                                    </div>
                                </td>
                            </tr>  
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </Layout>
  )
}

export default Cart
