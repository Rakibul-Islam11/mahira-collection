import { useParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeColor, setActiveColor] = useState(null);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [mainSwiper, setMainSwiper] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const q = query(collection(db, 'products'), where('productId', '==', productId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const productData = { id: doc.id, ...doc.data() };
                    setProduct(productData);

                    if (productData.isColorVariants && productData.colorVariants?.length > 0) {
                        setActiveColor(productData.colorVariants[0]);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return <div className="text-center py-8 text-lg">Product not found</div>;
    }

    const isOutOfStock = () => {
        if (product.isColorVariants) {
            return activeColor?.stock < 1;
        } else {
            return product.stock < 1;
        }
    };

    const isSizeOutOfStock = (sizeStock) => {
        return sizeStock < 1;
    };

    return (
        <div className="w-[100%] xl:w-[90%] mx-auto p-2 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Product Images */}
                <div className="md:sticky md:top-4">
                    {product.isColorVariants ? (
                        /* Color Variants Mode */
                        <>
                            {/* Main Image Swiper */}
                            <Swiper
                                spaceBetween={10}
                                navigation={{
                                    nextEl: '.main-next',
                                    prevEl: '.main-prev',
                                }}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[Navigation, Thumbs]}
                                className="mb-2 rounded-lg relative"
                            >
                                {activeColor?.images?.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className={`relative ${activeColor.stock < 1 ? 'opacity-70' : ''}`}>
                                            <img
                                                src={image}
                                                alt={`${product.name} - ${activeColor.colorName}`}
                                                className="w-full h-64 sm:h-80 md:h-[400px] object-cover"
                                            />
                                            {activeColor.stock < 1 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white text-lg sm:text-2xl font-bold bg-red-500 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black bg-opacity-70 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs sm:text-sm">
                                            <p>{activeColor.colorName}</p>
                                            <p>Stock: {activeColor.stock}</p>
                                        </div>
                                    </SwiperSlide>
                                ))}
                                <button className="main-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button className="main-next absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Swiper>

                            {/* Thumbnail Swiper */}
                            <div className="relative mt-2">
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={8}
                                    slidesPerView={4}
                                    freeMode={true}
                                    watchSlidesProgress={true}
                                    navigation={{
                                        nextEl: '.thumbnail-next',
                                        prevEl: '.thumbnail-prev',
                                    }}
                                    modules={[Navigation, Thumbs, FreeMode]}
                                    className="thumbnail-swiper"
                                >
                                    {product.colorVariants.map((variant, index) => (
                                        <SwiperSlide key={index}>
                                            <div
                                                className={`cursor-pointer border-2 ${activeColor?.colorName === variant.colorName ? 'border-blue-500' : 'border-transparent'} ${variant.stock < 1 ? 'opacity-70' : ''}`}
                                                onClick={() => setActiveColor(variant)}
                                            >
                                                <img
                                                    src={variant.thumbnail}
                                                    alt={variant.colorName}
                                                    className="w-full h-16 sm:h-20 object-cover"
                                                />
                                                {variant.stock < 1 && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold bg-red-500 px-1 py-0.5 rounded">
                                                            Out
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {product.colorVariants.length > 4 && (
                                    <>
                                        <button className="thumbnail-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button className="thumbnail-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Simple Images Mode */
                        <>
                            {/* Main Image Swiper */}
                            <Swiper
                                spaceBetween={10}
                                navigation={{
                                    nextEl: '.main-next',
                                    prevEl: '.main-prev',
                                }}
                                modules={[Navigation]}
                                className="mb-2 rounded-lg relative"
                                onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                                onSwiper={setMainSwiper}
                            >
                                {product.images?.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className={`relative ${product.stock < 1 ? 'opacity-70' : ''}`}>
                                            <img
                                                src={image}
                                                alt={product.name}
                                                className="w-full h-64 sm:h-80 md:h-[400px] object-cover"
                                            />
                                            {product.stock < 1 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white text-lg sm:text-2xl font-bold bg-red-500 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}
                                <button className="main-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button className="main-next absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Swiper>

                            {/* Thumbnail Swiper */}
                            {product.images?.length > 1 && (
                                <div className="relative mt-2">
                                    <Swiper
                                        spaceBetween={8}
                                        slidesPerView={4}
                                        freeMode={true}
                                        watchSlidesProgress={true}
                                        modules={[FreeMode]}
                                        className="thumbnail-swiper"
                                    >
                                        {product.images.map((image, index) => (
                                            <SwiperSlide key={index}>
                                                <div
                                                    className={`cursor-pointer border-2 ${activeImageIndex === index ? 'border-blue-500' : 'border-transparent'} ${product.stock < 1 ? 'opacity-70' : ''}`}
                                                    onClick={() => {
                                                        setActiveImageIndex(index);
                                                        if (mainSwiper) {
                                                            mainSwiper.slideTo(index);
                                                        }
                                                    }}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={product.name}
                                                        className="w-full h-16 sm:h-20 object-cover"
                                                    />
                                                    {product.stock < 1 && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold bg-red-500 px-1 py-0.5 rounded">
                                                                Out
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Product Details */}
                <div className="px-2 sm:px-0">
                    {/* Product Name */}
                    <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{product.name}</h1>

                    {/* Price Section */}
                    <div className="flex items-center mb-4 sm:mb-5">
                        <span className="text-lg sm:text-xl font-semibold text-gray-900">৳{product.price}</span>
                        {product.regularPrice && (
                            <span className="text-gray-500 line-through ml-2 text-sm sm:text-base">৳{product.regularPrice}</span>
                        )}
                        {product.discount > 0 && (
                            <span className="ml-2 bg-red-100 text-red-600 text-xs sm:text-sm px-2 py-0.5 rounded">
                                {product.discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Color Variant Selection */}
                    {product.isColorVariants && product.colorVariants?.length > 0 && (
                        <div className="mb-4 sm:mb-5">
                            <div className="flex items-center mb-2">
                                <h3 className="font-medium text-gray-700">Color:</h3>
                                <span className="ml-2 font-medium text-gray-900">{activeColor?.colorName}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.colorVariants.map((variant, index) => (
                                    <button
                                        key={index}
                                        className={`px-3 py-1 rounded-full border text-xs sm:text-sm transition-colors
                            ${activeColor?.colorName === variant.colorName
                                                ? 'bg-blue-100 border-blue-500 text-blue-800'
                                                : 'border-gray-300 text-gray-700 hover:border-gray-400'}
                            ${variant.stock < 1 ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        onClick={() => variant.stock >= 1 && setActiveColor(variant)}
                                        disabled={variant.stock < 1}
                                    >
                                        {variant.colorName}
                                        {variant.stock < 1 && ' (Out)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    {activeColor?.sizes?.length > 0 && (
                        <div className="mb-4 sm:mb-5">
                            <h3 className="font-medium text-gray-700 mb-2">Select Size</h3>
                            <div className="flex flex-wrap gap-2">
                                {activeColor.sizes.map((size, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <button
                                            className={`w-12 sm:w-14 px-2 py-1 rounded border text-xs sm:text-sm font-medium transition-colors
                                ${selectedSize?.size === size.size
                                                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'}
                                ${isSizeOutOfStock(size.stock) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            onClick={() => !isSizeOutOfStock(size.stock) && setSelectedSize(size)}
                                            disabled={isSizeOutOfStock(size.stock)}
                                        >
                                            {size.size}
                                        </button>
                                        <span className={`text-xs mt-1 ${isSizeOutOfStock(size.stock) ? 'text-red-500' : 'text-gray-500'}`}>
                                            {size.stock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock Status */}
                    <div className="flex items-center mb-5 sm:mb-6">
                        <span className={`font-medium ${isOutOfStock() ? 'text-red-500' : 'text-green-600'}`}>
                            {isOutOfStock() ? 'Out of Stock' : 'In Stock'}
                        </span>
                        {!isOutOfStock() && (
                            <span className="text-gray-500 ml-2 text-sm sm:text-base">
                                {product.isColorVariants ?
                                    (activeColor?.sizes?.length > 0 ?
                                        `${activeColor.sizes.reduce((total, size) => total + size.stock, 0)} available`
                                        : `${activeColor?.stock} available`)
                                    : `${product.stock} available`
                                }
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-6">
                        <button
                            className={`flex-1 max-w-[180px] px-4 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors
                ${isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            disabled={isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)}
                        >
                            Add to Cart
                        </button>
                        <button
                            className={`flex-1 max-w-[180px] px-4 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors
                ${isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'}`}
                            disabled={isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)}
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Product Description */}
                    <div className="mb-4 border-t pt-4">
                        <h2 className="font-semibold text-gray-800 mb-3">Product Details</h2>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {product.description || 'No description available.'}
                        </p>
                        <div>
                            <img src={product.detailsImage} alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;