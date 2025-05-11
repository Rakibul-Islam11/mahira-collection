import { Link, useParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, startAfter } from 'firebase/firestore';
import { useInfiniteQuery } from '@tanstack/react-query';

const NonDirectCategory = () => {
    const { gender } = useParams();
    const productsPerPage = 2;

    const fetchProducts = async ({ pageParam = null }) => {
        const q = pageParam
            ? query(
                collection(db, 'products'),
                where('gender', '==', gender),
                startAfter(pageParam),
                limit(productsPerPage)
            )
            : query(
                collection(db, 'products'),
                where('gender', '==', gender),
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
        queryKey: ['products', gender],
        queryFn: fetchProducts,
        getNextPageParam: (lastPage) => lastPage.lastVisible,
        staleTime: 5 * 60 * 1000,
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
                    ? (product.price - (product.price * (product.discount / 100))).toFixed(2)
                    : product.price,
                image: product.mainImage || product.images?.[0],
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Dispatch both events to ensure cart count updates everywhere
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    };

    const handleAddToCartOrRedirect = (product) => {
        const hasColorVariants = product.isColorVariants && product.colorVariants?.length > 0;

        if (hasColorVariants) {
            window.location.href = `/product/${product.productId || product.id}`;
        } else {
            addToCart(product);
        }
    };

    const handleOrderNow = (product) => {
        const hasColorVariants = product.isColorVariants && product.colorVariants?.length > 0;

        if (hasColorVariants) {
            // If product has color variants, go to product details page
            window.location.href = `/product/${product.productId || product.id}`;
        } else {
            // If no color variants, add to cart and go to cart page
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
        <div className=''>
            <h2 className="text-lg font-semibold mb-4">
                {gender}'s Collection
            </h2>

            {products.length === 0 ? (
                <p>No products found in this category.</p>
            ) : (
                <>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1 for_set-grid">
                        {products.map((product) => {
                            const hasDiscount = product.discount && product.discount > 0;
                            const hasColorVariants = product.isColorVariants && product.colorVariants?.length > 0;

                            return (
                                <li key={product.id} className="border border-gray-400 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col mb-6">
                                    <div className="p-3 flex-grow flex flex-col">
                                        <Link to={`/product/${product.productId || product.id}`} className="relative">
                                            <img
                                                src={product.mainImage || product.images?.[0]}
                                                alt={product.name}
                                                className="w-full h-48 object-cover mb-2"
                                            />
                                            {hasDiscount && (
                                                <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-md">
                                                    {product.discount}%
                                                </div>
                                            )}
                                        </Link>
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                            {product.name}
                                        </h3>

                                        <div className="mt-auto">
                                            <div className="flex flex-row items-center gap-2 space-y-0">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    ৳
                                                    {product.discount
                                                        ? (product.price - (product.price * (product.discount / 100))).toFixed(2)
                                                        : product.price}
                                                </div>

                                                {product.regularPrice && (
                                                    <div className="text-xs text-gray-500">
                                                        <del>৳{product.regularPrice}</del>
                                                    </div>
                                                )}
                                                <div>
                                                    {product.productType && <p className='text-red-400'>({product.productType})</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 pt-2 border-t border-gray-100 space-y-2">
                                        <div className="flex gap-2 mb-0">
                                            <button
                                                onClick={() => handleAddToCartOrRedirect(product)}
                                                className="flex-1 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                                            >
                                                {hasColorVariants ? 'Options' : 'Add to Cart'}
                                            </button>
                                            <button
                                                onClick={() => handleOrderNow(product)}
                                                className="flex-1 border border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                                            >
                                                Order Now
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center pt-1">
                                            <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                            {product.stock > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    {product.stock} units available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {hasNextPage && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded inline-flex items-center"
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Products'
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NonDirectCategory;