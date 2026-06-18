import React from 'react';

import LastArrivalsEight from '../../assets/images/Mens/eight.jpg';

const LatestProducts = () => {
    return (
        <section className="new-arrivals">
            <div className="container py-5">
                <h2>New Arrivals</h2>
                <div className="row mt-4">
                    <div className="col-md-3 col-6">
                        <div className="product card border-0">
                            <div className="card-img">
                                <img src={LastArrivalsEight} alt="" className='w-100' />
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

export default LatestProducts
