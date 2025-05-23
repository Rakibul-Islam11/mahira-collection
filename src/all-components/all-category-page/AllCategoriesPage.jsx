import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllProductsPage = () => {
    const productsPerPage = 10;
    const loadMoreCount = 6;
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const [loadingMore, setLoadingMore] = useState(false);
    const productsContainerRef = useRef(null);
    const scrollPositionRef = useRef(0);

    // Format price to show in BDT with comma separators and without paisa
    const formatPrice = (price) => {
        if (typeof price !== 'number') price = parseFloat(price) || 0;
        return new Intl.NumberFormat('en-BD', {
            style: 'decimal',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Fetch all products with React Query
    const { data: allProducts = [], isLoading } = useQuery({
        queryKey: ['allProducts'],
        queryFn: async () => {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const fetchedProducts = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.available && data.stock > 0) {
                    fetchedProducts.push({ id: doc.id, ...data });
                }
            });

            // Fisher-Yates shuffle algorithm
            const shuffledProducts = [...fetchedProducts];
            for (let i = shuffledProducts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledProducts[i], shuffledProducts[j]] = [shuffledProducts[j], shuffledProducts[i]];
            }

            return shuffledProducts;
        },
        staleTime: Infinity, // Never stale
        cacheTime: 24 * 60 * 60 * 1000, // 24 hours cache
    });

    // Calculate displayed products based on current page
    const displayedProducts = allProducts.slice(0, productsPerPage + (currentPage - 1) * loadMoreCount);

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.discount
                    ? Math.round(product.price - (product.price * (product.discount / 100)))
                    : Math.round(product.price),
                image: product.mainImage || product.images?.[0] || '/placeholder-product.jpg',
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Dispatch events to update cart count
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Show success toast
        toast.success(`${product.name} added to cart!`, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };

    const handleAddToCartOrRedirect = (product) => {
        const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;

        if (hasColorVariants) {
            // Redirect to product details page if color variants exist
            window.location.href = `/product/${product.id}`;
        } else {
            // Add to cart if no color variants
            addToCart(product);
        }
    };

    const handleOrderNow = (product) => {
        const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;

        if (hasColorVariants) {
            // Redirect to product details page if color variants exist
            window.location.href = `/product/${product.id}`;
        } else {
            // Add to cart and redirect to cart page if no color variants
            addToCart(product);
            window.location.href = '/cart';
        }
    };

    const loadMoreProducts = async () => {
        // Save current scroll position
        scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop;

        setLoadingMore(true);
        setSearchParams({ page: currentPage + 1 });
    };

    // Restore scroll position after products update
    useEffect(() => {
        if (scrollPositionRef.current > 0) {
            window.scrollTo(0, scrollPositionRef.current);
            scrollPositionRef.current = 0; // Reset after restoring
            setLoadingMore(false);
        }
    }, [displayedProducts]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium">Loading all products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='md:px-4 min-h-screen w-[100%]' ref={productsContainerRef}>
            {/* Toast Container */}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <h2 className="text-lg font-semibold px-2 md:px-0 mb-2 md:mb-4 mt-2">
                All Products /
            </h2>

            {displayedProducts.length === 0 ? (
                <p className="text-center py-8">No products found.</p>
            ) : (
                <>
                    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-2">
                        {displayedProducts.map((product) => {
                            const hasDiscount = product.discount && product.discount > 0;
                            const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;
                            const isMobile = window.innerWidth < 768;
                            const maxLength = isMobile ? 17 : 25;
                            const shouldTruncate = product.name.length > maxLength;
                            const truncatedName = shouldTruncate
                                ? `${product.name.substring(0, maxLength)}...`
                                : product.name;

                            // Calculate prices without paisa
                            const discountedPrice = hasDiscount
                                ? Math.round(product.price - (product.price * (product.discount / 100)))
                                : null;
                            const displayPrice = hasDiscount ? discountedPrice : Math.round(product.price);

                            return (
                                <li key={product.id} className="border bg-[#ffc1da] rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="p-1 flex-grow flex flex-col">
                                        {/* Fixed size image container for mobile */}
                                        <Link to={`/product/${product.id}`} className="relative block">
                                            <div className="w-full h-[150px] md:h-auto md:aspect-square overflow-hidden">
                                                <img
                                                    src={product.mainImage || product.images?.[0] || '/placeholder-product.jpg'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover mb-2 rounded-lg"
                                                />
                                            </div>
                                            {product.discount !== 0 && hasDiscount && (
                                                <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-md">
                                                    {product.discount}%
                                                </div>
                                            )}
                                        </Link>

                                        <div className="flex justify-between items-start">
                                            <h3 className="text-md font-medium text-gray-800 mb-1 flex-1">
                                                {truncatedName}
                                                {shouldTruncate && (
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="text-blue-500 inline-block ml-1"
                                                        aria-label="View full product name"
                                                    >
                                                        ..
                                                    </Link>
                                                )}
                                            </h3>
                                        </div>

                                        <div className="md:mt-auto">
                                            <div className="flex flex-col md:space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-base font-semibold text-gray-900">
                                                        ৳{formatPrice(displayPrice)}
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        <del>৳{product.regularPrice}</del>
                                                    </div>
                                                </div>
                                                {product.productType && (
                                                    <div className="text-xs text-red-400">
                                                        ({product.productType})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-1 pb-2 border-t border-gray-100  space-y-2">
                                        <div className="flex flex-col md:flex-row gap-1 md:gap-2 mb-[1px]">
                                            <button
                                                onClick={() => handleAddToCartOrRedirect(product)}
                                                className="w-full border border-blue-600 bg-blue-600 text-white hover:bg-red-700 hover:border-blue-700 py-0.5 md:py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                                            >
                                                {hasColorVariants ? 'Options' : 'Add to Cart'}
                                            </button>
                                            <button
                                                onClick={() => handleOrderNow(product)}
                                                className="w-full border border-green-600 bg-green-600 text-white hover:bg-red-700 hover:border-green-700 py-0.5 md:py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                                            >
                                                Order Now
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center text-xs">
                                            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                            {product.stock > 0 && (
                                                <span className="text-gray-500 text-[11px]">
                                                    {product.stock} units
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {allProducts.length > displayedProducts.length && (
                        <div className="flex justify-center mt-6 mb-10">
                            <button
                                onClick={loadMoreProducts}
                                disabled={loadingMore}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 flex items-center justify-center min-w-32"
                            >
                                {loadingMore ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    "Load More"
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AllProductsPage;