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
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!product) {
        return <div className="text-center py-8">Product not found</div>;
    }

    // Function to check if current product/variant is out of stock
    const isOutOfStock = () => {
        if (product.isColorVariants) {
            return activeColor?.stock < 1;
        } else {
            return product.stock < 1;
        }
    };

    // Function to check if a specific size is out of stock
    const isSizeOutOfStock = (sizeStock) => {
        return sizeStock < 1;
    };

    return (
        <div className="w-[100%] xl:w-[90%] mx-auto p-4">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Product Images with Swiper */}
                <div>
                    {product.isColorVariants ? (
                        /* Color Variants Mode */
                        <>
                            {/* Main Image Swiper */}
                            <Swiper
                                spaceBetween={10}
                                navigation={true}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[Navigation, Thumbs]}
                                className="mb-4 rounded-lg"
                            >
                                {activeColor?.images?.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className={`relative ${activeColor.stock < 1 ? 'opacity-70' : ''}`}>
                                            <img
                                                src={image}
                                                alt={`${product.name} - ${activeColor.colorName}`}
                                                className="w-full h-[400px] object-cover"
                                            />
                                            {activeColor.stock < 1 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white text-2xl font-bold bg-red-500 px-4 py-2 rounded-lg shadow-lg">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
                                            <p>{activeColor.colorName}</p>
                                            <p>Stock: {activeColor.stock}</p>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Thumbnail Swiper with Navigation */}
                            <div className="relative">
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={10}
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
                                                    className="w-full h-20 object-cover"
                                                />
                                                {variant.stock < 1 && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold bg-red-500 px-1 py-0.5 rounded">
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Navigation arrows - only show if more than 4 thumbnails */}
                                {product.colorVariants.length > 4 && (
                                    <>
                                        <button className="thumbnail-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button className="thumbnail-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full shadow-md hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
                                navigation={true}
                                modules={[Navigation]}
                                className="mb-4 rounded-lg"
                                onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                                onSwiper={setMainSwiper}
                            >
                                {product.images?.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className={`relative ${product.stock < 1 ? 'opacity-70' : ''}`}>
                                            <img
                                                src={image}
                                                alt={product.name}
                                                className="w-full h-[400px] object-cover"
                                            />
                                            {product.stock < 1 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white text-2xl font-bold bg-red-500 px-4 py-2 rounded-lg shadow-lg">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Thumbnail Swiper */}
                            {product.images?.length > 1 && (
                                <div className="relative">
                                    <Swiper
                                        spaceBetween={10}
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
                                                        className="w-full h-20 object-cover"
                                                    />
                                                    {product.stock < 1 && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold bg-red-500 px-1 py-0.5 rounded">
                                                                Out of Stock
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
                <div>
                    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                    <div className="mb-4">
                        <span className="text-xl font-semibold">৳{product.price}</span>
                        {product.regularPrice && (
                            <span className="text-gray-500 line-through ml-2">৳{product.regularPrice}</span>
                        )}
                    </div>

                    {/* Color Variant Selection - only show if color variants exist */}
                    {product.isColorVariants && product.colorVariants?.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-medium mb-2">Color: {activeColor?.colorName}</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.colorVariants.map((variant, index) => (
                                    <button
                                        key={index}
                                        className={`px-3 py-1 rounded-full border ${activeColor?.colorName === variant.colorName ? 'bg-blue-100 border-blue-500' : 'border-gray-300'} ${variant.stock < 1 ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        onClick={() => variant.stock >= 1 && setActiveColor(variant)}
                                        disabled={variant.stock < 1}
                                    >
                                        {variant.colorName}
                                        {variant.stock < 1 && ' (Out of Stock)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection - only show if sizes exist */}
                    {activeColor?.sizes?.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-medium mb-2">Size</h3>
                            <div className="flex flex-wrap gap-2">
                                {activeColor.sizes.map((size, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <button
                                            className={`px-3 py-1 rounded border ${selectedSize?.size === size.size ? 'bg-blue-100 border-blue-500' : 'border-gray-300'} ${isSizeOutOfStock(size.stock) ? 'opacity-70 cursor-not-allowed' : 'hover:border-blue-400'}`}
                                            onClick={() => !isSizeOutOfStock(size.stock) && setSelectedSize(size)}
                                            disabled={isSizeOutOfStock(size.stock)}
                                        >
                                            {size.size}
                                        </button>
                                        <span className={`text-xs mt-1 ${isSizeOutOfStock(size.stock) ? 'text-red-500' : 'text-gray-500'}`}>
                                            {size.stock} in stock
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <span className={`font-medium ${isOutOfStock() ? 'text-red-500' : 'text-green-600'}`}>
                            {isOutOfStock() ? 'Out of Stock' : 'In Stock'}
                        </span>
                        {!isOutOfStock() && (
                            <span className="text-gray-500 ml-2">
                                {product.isColorVariants ?
                                    (activeColor?.sizes?.length > 0 ?
                                        `${activeColor.sizes.reduce((total, size) => total + size.stock, 0)} units available`
                                        : `${activeColor?.stock} units available`)
                                    : `${product.stock} units available`
                                }
                            </span>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            className={`px-6 py-2 rounded ${isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            disabled={isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)}
                        >
                            Add to Cart
                        </button>
                        <button
                            className={`px-6 py-2 rounded ${isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            disabled={isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)}
                        >
                            Buy Now
                        </button>
                    </div>

                    <div className="mb-6 mt-4">
                        <h2 className="font-semibold mb-2">Description</h2>
                        <p>{product.description || 'No description available.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;