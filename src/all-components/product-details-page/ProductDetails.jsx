import { useParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc,  deleteDoc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import { Rating } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { toast } from 'react-toastify';
import { IoLogoWhatsapp } from 'react-icons/io';
import { IoCallSharp } from "react-icons/io5";

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeColor, setActiveColor] = useState(null);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [mainSwiper, setMainSwiper] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        name: '',
        contact: '',
        rating: 0,
        comment: '',
    });
    const [editingReviewId, setEditingReviewId] = useState(null);

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

    useEffect(() => {
        let unsubscribe;

        const setupReviewsListener = () => {
            if (!productId) return;

            const reviewsRef = collection(db, 'reviews');
            const q = query(reviewsRef, where('productId', '==', productId));

            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const reviewsData = [];
                querySnapshot.forEach((doc) => {
                    reviewsData.push({ id: doc.id, ...doc.data() });
                });
                setReviews(reviewsData);
            }, (error) => {
                console.error('Error listening to reviews:', error);
            });
        };

        setupReviewsListener();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [productId]);

    const addToCart = () => {
        if (isOutOfStock()) {
            toast.error('This product is out of stock');
            return;
        }

        if (product.isColorVariants && activeColor?.sizes?.length > 0 && !selectedSize) {
            toast.error('Please select a size');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Create cart item with all necessary information
        const cartItem = {
            id: product.id,
            productId: product.productId,
            name: product.name,
            price: product.discount
                ? (product.price - (product.price * (product.discount / 100))).toFixed(2)
                : product.price,
            image: product.isColorVariants ? activeColor?.images?.[0] : product.images?.[0],
            quantity: 1,
            color: product.isColorVariants ? {
                name: activeColor?.colorName,
                code: activeColor?.colorCode,
                image: activeColor?.images?.[0]
            } : null,
            size: selectedSize ? {
                size: selectedSize.size,
                stock: selectedSize.stock
            } : null,
            productType: product.productType,
            discount: product.discount || 0,
            regularPrice: product.regularPrice || null
        };

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => {
            // Basic match on product ID
            if (item.id !== cartItem.id) return false;

            // For color variants, check color match
            if (product.isColorVariants && item.color?.name !== cartItem.color?.name) return false;

            // For products with sizes, check size match
            if (selectedSize && item.size?.size !== cartItem.size?.size) return false;

            return true;
        });

        if (existingItemIndex >= 0) {
            // Update quantity if item exists
            cart[existingItemIndex].quantity += 1;
            toast.success('Item quantity increased in cart');
        } else {
            // Add new item to cart
            cart.push(cartItem);
            toast.success('Item added to cart');
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Dispatch events to update cart count
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    };

    const handleBuyNow = () => {
        addToCart();
        window.location.href = '/cart';
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!reviewForm.name || !reviewForm.comment || reviewForm.rating === 0 || !reviewForm.contact) {
            toast.error('Please fill all required fields');
            return;
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewForm.contact);
        const isPhone = /^[0-9]{10,15}$/.test(reviewForm.contact);

        if (!isEmail && !isPhone) {
            toast.error('Please enter a valid email or phone number');
            return;
        }

        try {
            const reviewData = {
                productId,
                productName: product.name,
                name: reviewForm.name,
                contact: reviewForm.contact,
                contactType: isEmail ? 'email' : 'phone',
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                createdAt: new Date().toISOString(),
            };

            if (editingReviewId) {
                await updateDoc(doc(db, 'reviews', editingReviewId), reviewData);
                toast.success('Review updated successfully');
            } else {
                await addDoc(collection(db, 'reviews'), reviewData);
                toast.success('Review submitted successfully');
            }

            setShowReviewForm(false);
            setReviewForm({
                name: '',
                contact: '',
                rating: 0,
                comment: '',
            });
            setEditingReviewId(null);
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        }
    };

    const handleEditReview = (review) => {
        setReviewForm({
            name: review.name,
            contact: review.contact || '',
            rating: review.rating,
            comment: review.comment,
        });
        setEditingReviewId(review.id);
        setShowReviewForm(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await deleteDoc(doc(db, 'reviews', reviewId));
                toast.success('Review deleted successfully');
            } catch (error) {
                console.error('Error deleting review:', error);
                toast.error('Failed to delete review');
            }
        }
    };

    const isOutOfStock = () => {
        if (product.isColorVariants) {
            if (activeColor?.sizes?.length > 0) {
                return !activeColor.sizes.some(size => size.stock > 0);
            }
            return activeColor?.stock < 1;
        } else {
            return product.stock < 1;
        }
    };

    const isSizeOutOfStock = (sizeStock) => {
        return sizeStock < 1;
    };

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

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="pt-6">
            {/* Review Form Modal */}
            {showReviewForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                {editingReviewId ? 'Edit Review' : 'Write a Review'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowReviewForm(false);
                                    setEditingReviewId(null);
                                    setReviewForm({
                                        name: '',
                                        contact: '',
                                        rating: 0,
                                        comment: '',
                                    });
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleReviewSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Your Name*</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={reviewForm.name}
                                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Email or Phone Number*</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={reviewForm.contact}
                                    onChange={(e) => setReviewForm({ ...reviewForm, contact: e.target.value })}
                                    required
                                    placeholder="example@email.com or 0123456789"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Rating*</label>
                                <Rating
                                    style={{ maxWidth: 150 }}
                                    value={reviewForm.rating}
                                    onChange={(value) => setReviewForm({ ...reviewForm, rating: value })}
                                    isRequired
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Your Review*</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows="4"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReviewForm(false);
                                        setEditingReviewId(null);
                                        setReviewForm({
                                            name: '',
                                            contact: '',
                                            rating: 0,
                                            comment: '',
                                        });
                                    }}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingReviewId ? 'Update Review' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                    <a
                        href="https://wa.me/8801407790565"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="flex flex-row items-center gap-2 text-green-500 text-[18px] cursor-pointer">
                            <span><IoLogoWhatsapp /></span>
                            <p>Ask for details</p>
                        </div>
                    </a>

                    {/* Rating Summary */}
                    <div className="flex items-center mb-3">
                        <Rating
                            style={{ maxWidth: 100 }}
                            value={averageRating}
                            readOnly
                        />
                        <span className="ml-2 text-gray-700">
                            {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>

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
                    <div>
                        {product.productType && <p className='text-red-400'>({product.productType})</p>}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-2">
                        <button
                            onClick={addToCart}
                            className={`flex-1 max-w-[180px] px-4 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors
                ${isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            disabled={isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)}
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className={`flex-1 max-w-[180px] px-4 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors
                ${isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'}`}
                            disabled={isOutOfStock() || (activeColor?.sizes?.length > 0 && !selectedSize)}
                        >
                            Buy Now
                        </button>
                    </div>
                    <div className="flex gap-1 md:gap-4 justify-start">
                        {/* Call Card */}
                        <a
                            href="tel:+8801407790565"
                            className="flex-1 bg-white shadow-md rounded-lg p-4 text-center hover:shadow-lg cursor-pointer border border-gray-300"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <IoCallSharp className="text-black text-2xl" />
                                </div>
                                <p className="font-semibold">কল করুন</p>
                                <p className="text-black">01303129042</p>
                            </div>
                        </a>

                        {/* WhatsApp Card */}
                        <a
                            href="https://wa.me/8801407790565"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white shadow-md rounded-lg p-4 text-center hover:shadow-lg cursor-pointer border border-gray-300"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <IoLogoWhatsapp className="text-green-500 text-2xl" />
                                </div>
                                <p className="font-semibold">মেসেজ করুন</p>
                                <p className="text-black">01303129042</p>
                            </div>
                        </a>
                    </div>

                </div>
            </div>

            {/* Description and Reviews Tabs Section */}
            <div className="mt-8 border-t pt-6">
                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`py-2 px-4 font-medium text-sm sm:text-base ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm sm:text-base ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({reviews.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="px-2 sm:px-0">
                    {activeTab === 'description' ? (
                        <div className="space-y-4">
                            {product.productType && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-blue-800 font-medium">
                                        ({product.productType}) condition: {product.preOrderDescription}
                                    </p>
                                </div>
                            )}

                            <div className="prose max-w-none text-gray-600">
                                {product.description || 'No description available.'}
                            </div>

                            {product.detailsImage && (
                                <div className="mt-4">
                                    <img
                                        src={product.detailsImage}
                                        alt="Product details"
                                        className="w-full rounded-lg border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Review Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex flex-col sm:flex-row items-center justify-between">
                                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                                        <h3 className="text-xl font-bold">{averageRating} out of 5</h3>
                                        <div className="flex justify-center sm:justify-start my-2">
                                            <Rating
                                                style={{ maxWidth: 120 }}
                                                value={averageRating}
                                                readOnly
                                            />
                                        </div>
                                        <p className="text-gray-600">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                                    </div>

                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Write a Review
                                    </button>
                                </div>
                            </div>

                            {/* Reviews List */}
                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold">{review.name}</h4>
                                                    <div className="flex items-center mt-1">
                                                        <Rating
                                                            style={{ maxWidth: 100 }}
                                                            value={review.rating}
                                                            readOnly
                                                        />
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditReview(review)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-gray-700">{review.comment}</p>
                                            {review.contact && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Contact: {review.contact}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                                    <p className="text-gray-500">Be the first to review this product</p>
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Write a Review
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;