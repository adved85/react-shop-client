import React from 'react';
import Layout from './common/Layout';
import { Link } from 'react-router-dom';

/********* Product Slider *************************/
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, FreeMode, Navigation  } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import { useState } from 'react';

import ProductImgFive from '../assets/images/Mens/five.jpg';
import ProductImgSix from '../assets/images/Mens/six.jpg';
import ProductImgSeven from '../assets/images/Mens/seven.jpg';

/** Rating **/
import { Rating } from 'react-simple-star-rating'

/** description and preview tabs **/
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const Product = () => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [rating, setRating] = useState(4.3);

    const handleRating = (rate) => {
        setRating(rate);

        // other logic
    }

    return (
        <Layout>
            <div className="container product-page">
                <div className="row">
                    <div className="col-md-12">
                        <nav aria-label="breadcrumb" className='pt-4'>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                                <li className="breadcrumb-item"><Link to="/shop">Shop</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Dummy Product Title</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row mb-5">

                    {/* product-images */}
                    <div className="col-md-5">
                        <div className="row">
                            <div className="col-md-2">
                                <Swiper
                                    style={{
                                        '--swiper-navigation-color': '#000',
                                        '--swiper-pagination-color': '#000',
                                        }}
                                        onSwiper={setThumbsSwiper}
                                        loop={true}
                                        direction={`vertical`}
                                        spaceBetween={10}
                                        slidesPerView={6}
                                        freeMode={true}
                                        watchSlidesProgress={true}
                                        modules={[FreeMode, Navigation, Thumbs]}
                                        className="mySwiper mt-2"
                                    >
                                            
                                    <SwiperSlide>
                                        <div className='content'>
                                            <img 
                                                src={ProductImgFive} 
                                                alt="" 
                                                height={100}
                                                className='w-100' />
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className='content'>
                                                <img 
                                                    src={ProductImgSix} 
                                                    alt="" 
                                                    height={100}
                                                    className='w-100' />
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className='content'>
                                            <img 
                                                src={ProductImgSeven} 
                                                alt="" 
                                                height={100}
                                                className='w-100' />
                                        </div>                                                                      
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                            <div className="col-md-10">
                                <Swiper
                                    style={{
                                    '--swiper-navigation-color': '#000',
                                    '--swiper-pagination-color': '#000',
                                    }}
                                    loop={true}
                                    spaceBetween={0}
                                    navigation={true}
                                    thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
                                    modules={[FreeMode, Navigation, Thumbs]}
                                    className="mySwiper2"
                                >
                                    
                                    <SwiperSlide >
                                        <div className='content'>
                                            <img 
                                                src={ProductImgFive} 
                                                alt="" 
                                                className='w-100' />
                                        </div>
                                        </SwiperSlide>
                                    <SwiperSlide >
                                        <div className='content'>
                                            <img 
                                                src={ProductImgSix} 
                                                alt="" 
                                                className='w-100' />
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div>
                                            <img 
                                                src={ProductImgSeven} 
                                                alt="" 
                                                className='w-100' />
                                        </div>
                                    </SwiperSlide>           
                                </Swiper>
                            </div>
                        </div>
                    </div>

                    {/* product details */}
                    <div className="col-md-7">

                        <h2>Dummy Product Title</h2>

                        <div className="d-flex align-items-center">
                            <Rating
                                size={20}
                                readonly
                                initialValue={rating}
                                /* onClick={handleRating} */
                            />
                            <span className='pt-1 ps-1'>10 reviews</span>
                        </div>

                        <div className="price h3">
                            $18 <span className='text-decoration-line-through'>$20</span>
                        </div>

                        <div className="short-description">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Corporis necessitatibus adipisci neque soluta, blanditiis 
                            tenetur quas beatae dolore nemo alias velit molestiae.
                        </div>

                        <div className="pt-3">
                            <strong>Select size</strong>
                            <div className="sizes pt-2">
                                
                                <button className="btn btn-size">S</button>
                                <button className="btn btn-size ms-1">M</button>
                                <button className="btn btn-size ms-1">L</button>
                                <button className="btn btn-size ms-1">XL</button>
                            </div>
                        </div>

                        <div className="add-to-cart">
                            <button className="btn btn-primary text-uppercase mt-4">
                                Add to cart
                            </button>
                        </div>

                        <div className='stock-keeping-unit'>
                            <strong >SKU: </strong>
                            RR123XXLLZ3
                        </div>

                    </div>
                </div>

                {/* preview-description-tabs */}

                <div className="row mb-5">
                    <div className="col-md-12">
                        <Tabs
                            defaultActiveKey="profile"
                            id="uncontrolled-tab-example"
                            className="mb-3"
                            >
                            <Tab eventKey="home" title="Description">
                                Tab content for Description
                            </Tab>
                            <Tab eventKey="profile" title="Reviews (10)">
                                Tab content for Reviews
                            </Tab>
                        </Tabs>
                    </div>
                </div>
                
            </div>

        </Layout>
    )
}

export default Product
