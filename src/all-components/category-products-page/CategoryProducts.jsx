import { useParams } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './category-product.css'
const CategoryProducts = () => {
    const { gender, category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(
                    collection(db, 'products'),
                    where('gender', '==', gender),
                    where('subcategory', 'array-contains', category.toLowerCase())
                );

                const querySnapshot = await getDocs(q);
                const fetchedProducts = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.available) { // ✅ শুধু available === true হলে push করবে
                        fetchedProducts.push({ id: doc.id, ...data });
                    }
                });

                setProducts(fetchedProducts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [gender, category]);


    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className='w-[100%] xl:w-[90%] mx-auto px-1 sm:px-0'>
            <h2 className="text-lg font-semibold mb-4">
                Showing products for {gender} / {category}
            </h2>

            {products.length === 0 ? (
                <p>No products found in this category.</p>
            ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1 for_set-grid">
                        {products.map((product) => (
                            <li key={product.id} className="border border-gray-400 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="p-3 flex-grow flex flex-col">
                                    <img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-48 object-cover mb-2"
                                    />
                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                        {product.name}
                                    </h3>

                                    <div className="mt-auto">
                                        <div className="flex flex-row items-center gap-2 space-y-0">
                                            <p className="text-lg font-semibold text-gray-900">৳{product.price}</p>
                                            {product.regularPrice && (
                                                <div className="text-xs text-gray-500">
                                                    <del>৳{product.regularPrice}</del>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons Section */}
                                <div className="p-3 pt-2 border-t border-gray-100 space-y-2">
                                    <div className="flex gap-2  mb-0 ">
                                        {/* Add to Cart Button */}
                                        <button className="flex-1 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200">
                                            Add to Cart
                                        </button>

                                        {/* Order Now Button */}
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
                        ))}
                    </ul>
            )}
        </div>
    );
};

export default CategoryProducts;
