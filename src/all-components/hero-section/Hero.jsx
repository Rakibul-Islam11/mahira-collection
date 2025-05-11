import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firbase.config'; // আপনার firebase config ফাইল

const Hero = () => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchSliderImages = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'hero-slider-images'));
                const imageList = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.image && data.image.url) {
                        imageList.push(data.image.url);
                    }
                });

                setImages(imageList);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchSliderImages();
    }, []);

    return (
        <div className="w-full">
            <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                navigation={false}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
            >
                {images.map((url, index) => (
                    <SwiperSlide key={index}>
                        <img
                            src={url}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-[200px] md:h-[450px] object-cover"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Hero;
