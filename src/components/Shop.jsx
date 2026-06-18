import React from 'react';

import Layout from './common/Layout';

import FeaturedProductsEleven from '../assets/images/Mens/eleven.jpg';

const Shop = () => {
  return (
    <div>
      <Layout>

        <div className="container">
          <nav aria-label="breadcrumb" className='pt-4'>
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="#">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">Shop</li>
            </ol>
          </nav>

          <div className="row">
            <div className="col-md-3">

              {/* categories */}
              <div className="card shadow border-0 mb-3">
                <div className="card-body">
                  <h3>Categories</h3>
                  <ul>
                    <li className='mb-2'>
                      <input type="checkbox" name="" id="" />
                      <label htmlFor="" className='ps-2'>Kids</label>
                    </li>
                    <li className='mb-2'>
                      <input type="checkbox" name="" id="" />
                      <label htmlFor="" className='ps-2'>Men</label>
                    </li>
                    <li className='mb-2'>
                      <input type="checkbox" name="" id="" />
                      <label htmlFor="" className='ps-2'>Women</label>
                    </li>
                  </ul>
                </div>
              </div>

              {/* brands */}
              <div className="card shadow border-0 mb-3">
                <div className="card-body">
                  <h3>Brands</h3>
                  <ul>
                    <li className='mb-2'>
                      <input type="checkbox" name="" id="" />
                      <label htmlFor="" className='ps-2'>Puma</label>
                    </li>
                    <li className='mb-2'>
                      <input type="checkbox" name="" id="" />
                      <label htmlFor="" className='ps-2'>Nike</label>
                    </li>
                    <li className='mb-2'>
                      <input type="checkbox" name="" id="" />
                      <label htmlFor="" className='ps-2'>Levis</label>
                    </li>
                    <li className='mb-2'>
                      <input type="checkbox" name="" id="" />
                      <label htmlFor="" className='ps-2'>Zara</label>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
            <div className="col-md-9">
              <div className="row">

                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={FeaturedProductsEleven} alt="" className='w-100' />
                    </div>
                    <div className="card-body pt-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50
                        <span className='text-decoration-line-through ps-2'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={FeaturedProductsEleven} alt="" className='w-100' />
                    </div>
                    <div className="card-body pt-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50
                        <span className='text-decoration-line-through ps-2'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={FeaturedProductsEleven} alt="" className='w-100' />
                    </div>
                    <div className="card-body pt-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50
                        <span className='text-decoration-line-through ps-2'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={FeaturedProductsEleven} alt="" className='w-100' />
                    </div>
                    <div className="card-body pt-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50
                        <span className='text-decoration-line-through ps-2'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={FeaturedProductsEleven} alt="" className='w-100' />
                    </div>
                    <div className="card-body pt-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50
                        <span className='text-decoration-line-through ps-2'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}

export default Shop
