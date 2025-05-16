import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { db } from '../../../firbase.config';


const CategorySlider = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Reference to the menu-categories collection and men/women documents
                const menDocRef = doc(db, 'menu-categories', 'men');
                const womenDocRef = doc(db, 'menu-categories', 'women');

                // Fetch both documents
                const [menDoc, womenDoc] = await Promise.all([
                    getDoc(menDocRef),
                    getDoc(womenDocRef)
                ]);

                // Combine items from both documents
                const menItems = menDoc.exists() ? menDoc.data().items || [] : [];
                const womenItems = womenDoc.exists() ? womenDoc.data().items || [] : [];

                // Combine and set categories
                setCategories([...menItems, ...womenItems]);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Error loading categories: {error}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="text-gray-500 text-center p-4">
                No categories found
            </div>
        );
    }

    return (
        <div className="py-8 px-1 md:px-3 max-w-7xl mx-auto relative">
            <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={15}
                slidesPerView={3}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                navigation={{
                    nextEl: '.category-swiper-button-next',
                    prevEl: '.category-swiper-button-prev',
                }}
                pagination={{
                    clickable: true,
                    el: '.category-swiper-pagination',
                    type: 'bullets',
                    bulletClass: 'swiper-pagination-bullet bg-blue-200',
                    bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-500'
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 3,
                        spaceBetween: 10
                    },
                    480: {
                        slidesPerView: 3,
                        spaceBetween: 15
                    },
                    640: {
                        slidesPerView: 3,
                        spaceBetween: 20
                    },
                    768: {
                        slidesPerView: 4,
                        spaceBetween: 20
                    },
                    1024: {
                        slidesPerView: 5,
                        spaceBetween: 20
                    },
                    1280: {
                        slidesPerView: 6,
                        spaceBetween: 20
                    },
                }}
                className="relative"
            >
                {categories.map((category, index) => (
                    <SwiperSlide key={index}>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                            <a href={category.path} className="block flex-1 flex flex-col">
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                                        }}
                                    />
                                </div>
                                <div className="p-3 sm:px-4 py-3 gap-1 md:gap-0 flex-1 flex flex-col justify-between">
                                    <h3 className="text-[11px] sm:text-lg font-semibold text-gray-800 text-center">
                                        {category.name}
                                    </h3>
                                    <button className="mt-0 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white py-1 sm:py-2 px-3 sm:px-4 rounded-md transition-colors duration-300 text-xs sm:text-sm w-full">
                                        Shop Now
                                    </button>
                                </div>
                            </a>
                        </div>
                    </SwiperSlide>
                ))}

                {/* Custom Navigation Buttons */}
                <div className="category-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-2 md:-ml-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </div>
                <div className="category-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-2 md:-mr-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </Swiper>

            {/* Custom Pagination */}
            <div className="category-swiper-pagination flex justify-center mt-4 sm:mt-6 space-x-2"></div>

            <style jsx global>{`
                .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    opacity: 1;
                    margin: 0 4px !important;
                }
                .swiper-pagination-bullet-active {
                    transform: scale(1.2);
                }
                @media (min-width: 640px) {
                    .swiper-pagination-bullet {
                        width: 10px;
                        height: 10px;
                        margin: 0 5px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CategorySlider;