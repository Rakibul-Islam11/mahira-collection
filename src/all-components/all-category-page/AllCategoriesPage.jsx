import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const AllProductsPage = () => {
    const productsPerPage = 3;
    const loadMoreCount = 2;
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const [loadingMore, setLoadingMore] = useState(false);

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

    const loadMoreProducts = async () => {
        setLoadingMore(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setSearchParams({ page: currentPage + 1 });
        setLoadingMore(false);
    };

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
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
        <div className='w-[100%] xl:w-[90%] mx-auto px-3 sm:px-0'>
            <h2 className="text-lg font-semibold mb-4 mt-2">
                All Products/
            </h2>

            {displayedProducts.length === 0 ? (
                <p className="text-center py-8">No products found.</p>
            ) : (
                <>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1 for_set-grid">
                        {displayedProducts.map((product) => {
                            const hasDiscount = product.discount && product.discount > 0;

                            return (
                                <li key={product.id} className="border border-gray-400 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col mb-6">
                                    <div className="p-3 flex-grow flex flex-col">
                                        <Link to={`/product/${product.id}`} className="relative">
                                            <img
                                                src={product.mainImage || product.images?.[0] || '/placeholder-product.jpg'}
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
                                            <button className="flex-1 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200">
                                                Add to Cart
                                            </button>
                                            <button className="flex-1 border border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200">
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