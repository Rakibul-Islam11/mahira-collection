import { Link, useParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, startAfter } from 'firebase/firestore';
import './category-product.css';

const CategoryProducts = () => {
    const { gender, category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const productsPerPage = 2;

    useEffect(() => {
        const fetchInitialProducts = async () => {
            try {
                const q = query(
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

                setProducts(fetchedProducts);
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                setHasMore(fetchedProducts.length === productsPerPage);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchInitialProducts();
    }, [gender, category]);

    const loadMoreProducts = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'products'),
                where('gender', '==', gender),
                where('subcategory', 'array-contains', category.toLowerCase()),
                startAfter(lastVisible),
                limit(productsPerPage)
            );

            const querySnapshot = await getDocs(q);
            const newProducts = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.available && data.stock > 0) {
                    newProducts.push({ id: doc.id, ...data });
                }
            });

            setProducts([...products, ...newProducts]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(newProducts.length === productsPerPage);
            setPage(page + 1);
        } catch (error) {
            console.error('Error fetching more products:', error);
        }
        setLoading(false);
    };


    return (
        <div className='w-[100%] xl:w-[90%] mx-auto px-3 sm:px-0'>
            <h2 className="text-lg font-semibold mb-4">
                Showing products for {gender} / {category}
            </h2>

            {products.length === 0 ? (
                <p>No products found in this category.</p>
            ) : (
                <>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1 for_set-grid">
                        {products.map((product) => {
                            const hasDiscount = product.discount && product.discount > 0;

                            return (
                                <li key={product.id} className="border border-gray-400 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col mb-6">
                                    <div className="p-3 flex-grow flex flex-col">
                                        <Link to={`/product/${product.productId}`} className="relative">
                                            <img
                                                src={product.mainImage}
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

                    {hasMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={loadMoreProducts}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded inline-flex items-center"
                            >
                                {loading ? (
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

export default CategoryProducts;