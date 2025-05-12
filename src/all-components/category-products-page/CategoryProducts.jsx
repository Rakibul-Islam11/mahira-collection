import { Link, useParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useEffect, useRef, useState } from 'react';
import { collection, query, where, getDocs, limit, startAfter } from 'firebase/firestore';
import { useInfiniteQuery } from '@tanstack/react-query';
import './category-product.css';

const CategoryProducts = () => {
    const { gender, category } = useParams();
    const productsPerPage = 2;
    const productsContainerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Format price to show in thousands with comma and without decimals
    const formatPrice = (price) => {
        if (!price) return '0';
        return Math.round(price).toLocaleString('en-US');
    };

    const fetchProducts = async ({ pageParam = null }) => {
        const q = pageParam
            ? query(
                collection(db, 'products'),
                where('gender', '==', gender),
                where('subcategory', 'array-contains', category.toLowerCase()),
                startAfter(pageParam),
                limit(productsPerPage)
            )
            : query(
                collection(db, 'products'),
                where('gender', '==', gender),
                where('subcategory', 'array-contains', category.toLowerCase()),
                limit(productsPerPage)
            );


        const querySnapshot = await getDocs(q);
        const fetchedProducts = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.available && data.stock > 0) {
                fetchedProducts.push({ id: doc.id, ...data });
            }
        });

        return {
            products: fetchedProducts,
            lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
        };
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['products', gender, category],
        queryFn: fetchProducts,
        getNextPageParam: (lastPage) => lastPage.lastVisible,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        keepPreviousData: true
    });

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                productId: product.productId,
                name: product.name,
                price: product.discount
                    ? Math.round(product.price - (product.price * (product.discount / 100)))
                    : Math.round(product.price),
                image: product.mainImage,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    };

    const handleAddToCartOrRedirect = (product) => {
        const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;

        if (hasColorVariants) {
            window.location.href = `/product/${product.productId || product.id}`;
        } else {
            addToCart(product);
        }
    };

    const handleOrderNow = (product) => {
        const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;

        if (hasColorVariants) {
            window.location.href = `/product/${product.productId || product.id}`;
        } else {
            addToCart(product);
            window.location.href = '/cart';
        }
    };

    const products = data?.pages.flatMap(page => page.products) || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-8">Error loading products</div>;
    }

    return (
        <div className='' ref={productsContainerRef}>
            <h2 className="text-lg font-semibold mb-4 mt-2">
                Showing products for {gender} / {category}
            </h2>

            {products.length === 0 ? (
                <p className="text-center py-8">No products found in this category.</p>
            ) : (
                <>
                    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-1">
                        {products.map((product) => {
                            const hasDiscount = product.discount && product.discount > 0;
                            const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;
                            const maxLength = isMobile ? 17 : 25;
                            const shouldTruncate = product.name.length > maxLength;
                            const truncatedName = shouldTruncate
                                ? `${product.name.substring(0, maxLength)}...`
                                : product.name;

                            return (
                                <li key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="p-1 flex-grow flex flex-col">
                                        <Link to={`/product/${product.productId || product.id}`} className="relative block">
                                            <div className="w-full h-[150px] md:h-auto md:aspect-square overflow-hidden">
                                                <img
                                                    src={product.mainImage || '/placeholder-product.jpg'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover mb-2 rounded-lg"
                                                />
                                            </div>
                                            {hasDiscount && (
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
                                                        to={`/product/${product.productId || product.id}`}
                                                        className="text-blue-500 inline-block ml-1"
                                                        aria-label="View full product name"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.location.href = `/product/${product.productId || product.id}`;
                                                        }}
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
                                                        ৳{formatPrice(
                                                            product.discount
                                                                ? product.price - (product.price * (product.discount / 100))
                                                                : product.price
                                                        )}
                                                    </div>

                                                    {product.regularPrice && (
                                                        <div className="text-xs text-gray-500">
                                                            <del>৳{formatPrice(product.regularPrice)}</del>
                                                        </div>
                                                    )}
                                                </div>
                                                {product.productType && (
                                                    <div className="text-xs text-red-400">
                                                        ({product.productType})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-2 pb-2 border-t border-gray-100 space-y-2">
                                        <div className="flex md:flex-row flex-col gap-1 md:gap-2 mb-[1px]">
                                            <button
                                                onClick={() => handleAddToCartOrRedirect(product)}
                                                className="w-full border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white py-0.5 md:py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                                            >
                                                {hasColorVariants ? 'Options' : 'Add to Cart'}
                                            </button>
                                            <button
                                                onClick={() => handleOrderNow(product)}
                                                className="w-full border border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white py-0.5 md:py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
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

                    {hasNextPage && (
                        <div className="flex justify-center mt-6 mb-10">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 flex items-center justify-center min-w-32"
                            >
                                {isFetchingNextPage ? (
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

export default CategoryProducts;