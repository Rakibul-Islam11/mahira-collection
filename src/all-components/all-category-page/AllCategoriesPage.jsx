// all-components/all-categories-page/AllCategoriesPage.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firbase.config';


const AllCategoriesPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true);
                const querySnapshot = await getDocs(collection(db, 'products'));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching all products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    if (loading) {
        return <div>Loading all products...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">All Products</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md">
                        <img
                            src={product.images?.[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-full h-48 object-cover mb-4"
                        />
                        <h2 className="font-semibold">{product.name}</h2>
                        <p className="text-gray-600">${product.price}</p>
                        <p className="text-sm text-gray-500 capitalize">{product.gender} - {product.subcategory}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllCategoriesPage;