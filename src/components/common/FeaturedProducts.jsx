import React from 'react';

import FeaturedProductsEleven from '../../assets/images/Mens/eleven.jpg';


const FeaturedProducts = () => {
  return (
    <section className="featured-products">
        <div className="container py-5">
            <h2>Featured Products</h2>
            <div className="row mt-4">
                <div className="col-md-3 col-6">
                    <div className="product card border-0">
                        <div className="card-img">
                            <img src={FeaturedProductsEleven} alt="" className='w-100' />
                        </div>
                        <div className="card-body pt-3">
                            <a href="">Red Check Shirt for Men</a>
                            <div className="price">
                                $50
                                <span className='text-decoration-line-through'>$80</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default FeaturedProducts
