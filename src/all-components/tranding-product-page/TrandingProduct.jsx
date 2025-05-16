import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firbase.config';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const truncate = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const TrendingProducts = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                const productsRef = collection(db, 'products');
                const q = query(productsRef, where('subcategory', 'array-contains', 'trending'));
                const querySnapshot = await getDocs(q);

                const products = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setTrendingProducts(products);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching trending products:', err);
            }
        };

        fetchTrendingProducts();
    }, []);

    if (loading) return <div className="text-center py-8">Loading products...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-1 relative">
            <h2 className="text-3xl font-bold mb-6 text-center">🔥 Trending Products</h2>

            {trendingProducts.length === 0 ? (
                <p className="text-center text-gray-500">No trending products found.</p>
            ) : (
                <div className="relative">
                    <Swiper
                        modules={[Navigation, Pagination, A11y, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.swiper-button-next-custom',
                            prevEl: '.swiper-button-prev-custom',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.swiper-pagination-custom',
                            type: 'bullets',
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        loop={false}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 25,
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                            },
                        }}
                    >
                        {trendingProducts.map((product) => (
                            <SwiperSlide key={product.id}>
                                <div className="bg-[#ffc1da] rounded-xl shadow hover:shadow-xl transition-all h-[380px] flex flex-col overflow-hidden">
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={product.mainImage || '/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    </Link>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <Link to={`/product/${product.id}`}>
                                            <h3 className="text-lg font-semibold mb-1 hover:text-blue-600">
                                                {truncate(product.name, 24)}
                                            </h3>
                                        </Link>
                                        <div className="flex flex-row gap-2 items-center">
                                            <p className="text-gray-700 font-medium">৳{product.price}</p>
                                            {product.regularPrice && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    ৳{product.regularPrice}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2 mb-3">
                                            {product.subcategory?.map((subcat, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-2 py-1 text-xs rounded-full ${subcat === 'trending'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {subcat}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="mt-auto bg-blue-600 text-white py-2 text-center rounded hover:bg-blue-700 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Buttons */}
                    <div className="swiper-button-prev-custom absolute top-1/2 -left-2 md:-left-5 z-10 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-600 cursor-pointer transition-all">
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="swiper-button-next-custom absolute top-1/2 -right-2 md:-right-5 z-10 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-600 cursor-pointer transition-all">
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </div>

                    {/* Custom Pagination Container */}
                    <div className="swiper-pagination-custom mt-4 flex justify-center"></div>
                </div>
            )}

            {/* Pagination Styles */}
            <style jsx>{`
                .swiper-pagination-custom {
                    position: static;
                    margin-top: 20px;
                }
                .swiper-pagination-custom .swiper-pagination-bullet {
                    width: 12px;
                    height: 12px;
                    background-color: #ccc;
                    opacity: 1;
                    margin: 0 5px;
                }
                .swiper-pagination-custom .swiper-pagination-bullet-active {
                    background-color: #3b82f6; /* blue-500 */
                }
            `}</style>
        </div>
    );
};

export default TrendingProducts;