import React from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import HeroImg from '../../assets/images/banner-1.jpg';
import HeroImg2 from '../../assets/images/banner-2.jpg';

const Hero = () => {
    return (
        <section className="swiper-slider-main">
            <Swiper
                spaceBetween={0}
                slidesPerView={1}
                breakpoints={{
                    1024: {
                        slidesPerView: 1,
                        spaceBetween: 0,
                    }
                }}
            >
                <SwiperSlide>
                    <div className="content" style={{ backgroundImage: `url(${HeroImg2})` }}>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="content" style={{ backgroundImage: `url(${HeroImg})` }}>
                    </div>
                </SwiperSlide>
            </Swiper>
        </section>
    )
}

export default Hero
