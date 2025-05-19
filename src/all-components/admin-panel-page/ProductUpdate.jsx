import { collection, deleteDoc, doc, getDocs, updateDoc, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../../../firbase.config';
import './product-update.css'

const ProductUpdate = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [pageSize] = useState(10);

    const [editingProduct, setEditingProduct] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        regularPrice: '',
        price: '',
        discount: 0,
        description: '',
        category: '',
        mainImage: '',
        colorVariants: []
    });

    useEffect(() => {
        const fetchInitialProducts = async () => {
            try {
                setLoading(true);
                const productsCollection = collection(db, 'products');
                const q = query(
                    productsCollection,
                    orderBy('name'),
                    limit(pageSize)
                );
                const productSnapshot = await getDocs(q);

                const productsList = productSnapshot.docs.map(doc => formatProductData(doc));
                setProducts(productsList);

                const lastDoc = productSnapshot.docs[productSnapshot.docs.length - 1];
                setLastVisible(lastDoc);
                setHasMore(productSnapshot.docs.length === pageSize);
                setInitialLoadComplete(true);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialProducts();
    }, [pageSize]);

    const formatProductData = (doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || '',
            regularPrice: data.regularPrice || data.price || 0,
            price: data.price || 0,
            discount: data.discount || 0,
            description: data.description || '',
            category: data.category || '',
            mainImage: data.mainImage || '',
            colorVariants: Array.isArray(data.colorVariants)
                ? data.colorVariants.map(variant => ({
                    colorName: variant.colorName || '',
                    thumbnail: variant.thumbnail || '',
                    images: Array.isArray(variant.images) ? variant.images : [],
                    sizes: Array.isArray(variant.sizes)
                        ? variant.sizes.map(size => ({
                            size: size.size || '',
                            stock: Number(size.stock) || 0
                        }))
                        : [],
                    stock: Number(variant.stock) || 0
                }))
                : []
        };
    };

    const loadMoreProducts = async () => {
        if (!lastVisible || !hasMore) return;

        setLoading(true);
        try {
            const productsCollection = collection(db, 'products');
            const q = query(
                productsCollection,
                orderBy('name'),
                startAfter(lastVisible),
                limit(pageSize)
            );
            const productSnapshot = await getDocs(q);

            const newProducts = productSnapshot.docs.map(doc => formatProductData(doc));
            setProducts(prev => [...prev, ...newProducts]);

            const lastDoc = productSnapshot.docs[productSnapshot.docs.length - 1];
            setLastVisible(lastDoc);
            setHasMore(productSnapshot.docs.length === pageSize);
        } catch (error) {
            console.error("Error loading more products: ", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (product.name || '').toLowerCase().includes(searchLower) ||
            (product.category || '').toLowerCase().includes(searchLower) ||
            (product.description || '').toLowerCase().includes(searchLower)
        );
    });

    const handleEditClick = (product) => {
        setEditingProduct(product.id);
        setEditFormData({
            name: product.name || '',
            regularPrice: product.regularPrice || product.price || 0,
            price: product.price || 0,
            discount: product.discount || 0,
            description: product.description || '',
            category: product.category || '',
            mainImage: product.mainImage || '',
            colorVariants: Array.isArray(product.colorVariants)
                ? product.colorVariants.map(variant => ({
                    colorName: variant.colorName || '',
                    thumbnail: variant.thumbnail || '',
                    images: variant.images || [],
                    sizes: variant.sizes || [],
                    stock: variant.stock || 0
                }))
                : []
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'regularPrice' || name === 'price' || name === 'discount') {
            const isValid = /^[0-9]*\.?[0-9]*$/.test(value);
            if (!isValid && value !== '') return;
        }

        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleColorVariantChange = (colorIndex, field, value) => {
        const updatedColorVariants = [...editFormData.colorVariants];

        if (!updatedColorVariants[colorIndex]) {
            updatedColorVariants[colorIndex] = {
                colorName: '',
                thumbnail: '',
                images: [],
                sizes: [],
                stock: 0
            };
        }

        updatedColorVariants[colorIndex] = {
            ...updatedColorVariants[colorIndex],
            [field]: field === 'images' ? value.split(',').map(url => url.trim()) : value
        };

        setEditFormData({
            ...editFormData,
            colorVariants: updatedColorVariants
        });
    };

    const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
        const updatedColorVariants = [...editFormData.colorVariants];

        if (!updatedColorVariants[colorIndex]) {
            updatedColorVariants[colorIndex] = {
                colorName: '',
                thumbnail: '',
                images: [],
                sizes: [],
                stock: 0
            };
        }

        if (!updatedColorVariants[colorIndex].sizes) {
            updatedColorVariants[colorIndex].sizes = [];
        }

        if (!updatedColorVariants[colorIndex].sizes[sizeIndex]) {
            updatedColorVariants[colorIndex].sizes[sizeIndex] = {
                size: '',
                stock: 0
            };
        }

        updatedColorVariants[colorIndex].sizes[sizeIndex] = {
            ...updatedColorVariants[colorIndex].sizes[sizeIndex],
            [field]: field === 'stock' ? parseInt(value) || 0 : value
        };

        // Calculate total stock
        const totalStock = updatedColorVariants[colorIndex].sizes.reduce(
            (sum, size) => sum + (size.stock || 0), 0
        );
        updatedColorVariants[colorIndex].stock = totalStock;

        setEditFormData({
            ...editFormData,
            colorVariants: updatedColorVariants
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productRef = doc(db, 'products', editingProduct);
            await updateDoc(productRef, editFormData);
            setProducts(products.map(product =>
                product.id === editingProduct ? { ...product, ...editFormData } : product
            ));
            setEditingProduct(null);
            alert('Product updated successfully!');
        } catch (error) {
            console.error("Error updating product: ", error);
            alert('Error updating product');
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(db, 'products', productId));
                setProducts(products.filter(product => product.id !== productId));
                alert('Product deleted successfully!');
            } catch (error) {
                console.error("Error deleting product: ", error);
                alert('Error deleting product');
            }
        }
    };

    if (loading && !initialLoadComplete) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Product Management</h1>

            {/* Search Box */}
            <div className="mb-4 sm:mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, category or description..."
                        className="w-full p-2 sm:p-3 pl-8 sm:pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-2 sm:left-3 top-2 sm:top-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Products Count */}
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchTerm && ` matching "${searchTerm}"`}
                {!searchTerm && ` (${hasMore ? 'first' : ''} ${products.length} of all products)`}
            </div>

            {/* Products List */}
            <div className="grid gap-4 sm:gap-6">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-6 sm:py-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-sm sm:text-base text-gray-500">No products found</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 text-sm sm:text-base text-blue-600 hover:text-blue-800"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="w-[450px] sm:w-[100%] border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm bg-white for_res">
                                {editingProduct === product.id ? (
                                    // Edit Form
                                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                        {/* Basic Information Section */}
                                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">Basic Information</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name *</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editFormData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category *</label>
                                                    <input
                                                        type="text"
                                                        name="category"
                                                        value={editFormData.category}
                                                        onChange={handleInputChange}
                                                        className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Regular Price *</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*\.?[0-9]*"
                                                        name="regularPrice"
                                                        value={editFormData.regularPrice}
                                                        onChange={handleInputChange}
                                                        className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*\.?[0-9]*"
                                                        name="price"
                                                        value={editFormData.price}
                                                        onChange={handleInputChange}
                                                        className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*\.?[0-9]*"
                                                        name="discount"
                                                        value={editFormData.discount}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        max="100"
                                                        className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3 sm:mt-4">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description *</label>
                                                <textarea
                                                    name="description"
                                                    value={editFormData.description}
                                                    onChange={handleInputChange}
                                                    className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                    rows="3"
                                                    required
                                                />
                                            </div>

                                            <div className="mt-3 sm:mt-4">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Main Image URL *</label>
                                                <input
                                                    type="text"
                                                    name="mainImage"
                                                    value={editFormData.mainImage}
                                                    onChange={handleInputChange}
                                                    className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                    required
                                                />
                                                {editFormData.mainImage && (
                                                    <div className="mt-1 sm:mt-2">
                                                        <img
                                                            src={editFormData.mainImage}
                                                            alt="Preview"
                                                            className="h-16 sm:h-20 object-cover rounded border"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Color Variants Section */}
                                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                                <h2 className="text-base sm:text-lg md:text-xl font-semibold">Color Variants</h2>
                                            </div>

                                            {(editFormData.colorVariants || []).map((colorVariant, colorIndex) => (
                                                <div key={colorIndex} className="border border-gray-200 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 bg-white">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2 sm:mb-3">
                                                        <div>
                                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Color Name *</label>
                                                            <input
                                                                type="text"
                                                                value={colorVariant.colorName || ''}
                                                                onChange={(e) => handleColorVariantChange(colorIndex, 'colorName', e.target.value)}
                                                                className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Total Stock</label>
                                                            <input
                                                                type="text"
                                                                value={colorVariant.stock || 0}
                                                                readOnly
                                                                className="w-full p-1 sm:p-2 border border-gray-300 rounded bg-gray-100 text-sm sm:text-base"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Thumbnail URL *</label>
                                                            <input
                                                                type="text"
                                                                value={colorVariant.thumbnail || ''}
                                                                onChange={(e) => handleColorVariantChange(colorIndex, 'thumbnail', e.target.value)}
                                                                className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                                required
                                                            />
                                                            {colorVariant.thumbnail && (
                                                                <div className="mt-1 sm:mt-2">
                                                                    <img
                                                                        src={colorVariant.thumbnail}
                                                                        alt="Thumbnail Preview"
                                                                        className="h-12 sm:h-16 object-cover rounded border"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = 'https://via.placeholder.com/100?text=Thumbnail+Error';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Images */}
                                                    <div className="mb-3 sm:mb-4">
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated) *</label>
                                                        <input
                                                            type="text"
                                                            value={(colorVariant.images || []).join(', ')}
                                                            onChange={(e) => handleColorVariantChange(colorIndex, 'images', e.target.value)}
                                                            className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                                            required
                                                        />
                                                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                                            {colorVariant.images?.map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={img}
                                                                    alt={`Preview ${idx}`}
                                                                    className="h-10 sm:h-12 object-cover rounded border"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/50?text=Image+Error';
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Sizes */}
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Sizes and Stock</h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                                                            {(colorVariant.sizes || []).map((size, sizeIndex) => (
                                                                <div key={sizeIndex} className="border border-gray-200 p-2 sm:p-3 rounded bg-gray-50">
                                                                    <div className="mb-1 sm:mb-2">
                                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Size</label>
                                                                        <input
                                                                            type="text"
                                                                            value={size.size || ''}
                                                                            onChange={(e) => handleSizeChange(colorIndex, sizeIndex, 'size', e.target.value)}
                                                                            className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={size.stock || 0}
                                                                            onChange={(e) => handleSizeChange(colorIndex, sizeIndex, 'stock', e.target.value)}
                                                                            className="w-full p-1 sm:p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingProduct(null)}
                                                className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm sm:text-base"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    // Product Display
                                    <>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                            <div>
                                                <h2 className="text-base sm:text-lg md:text-xl font-bold">{product.name || 'Unnamed Product'}</h2>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {product.discount > 0 && (
                                                        <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full text-xs">
                                                            {product.discount}% OFF
                                                        </span>
                                                    )}
                                                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-xs">
                                                        {product.category || 'Uncategorized'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-1 sm:space-x-2 mt-2 sm:mt-0">
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-xs sm:text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-xs sm:text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Main Product Image */}
                                        {product.mainImage && (
                                            <div className="mb-3 sm:mb-4">
                                                <img
                                                    src={product.mainImage}
                                                    alt={product.name || 'Product image'}
                                                    className="w-full h-40 sm:h-48 md:h-64 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <p className="text-gray-600 break-words mb-3 sm:mb-4 text-xs sm:text-sm">
                                            {product.description || 'No description available'}
                                        </p>

                                        <div className="flex items-center mb-3 sm:mb-4">
                                            {product.discount > 0 ? (
                                                <div className="flex items-center space-x-1 sm:space-x-2">
                                                    <span className="text-sm sm:text-base font-semibold text-gray-500 line-through">
                                                        ${product.regularPrice || product.price || 0}
                                                    </span>
                                                    <span className="text-sm sm:text-base font-semibold text-red-600">
                                                        ${product.price || 0}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm sm:text-base font-semibold">${product.regularPrice || product.price || 0}</span>
                                            )}
                                        </div>

                                        {/* Color Variants Display */}
                                        <div className="mt-3 sm:mt-4">
                                            <h3 className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">Color Variants:</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                {(product.colorVariants || []).map((variant, index) => (
                                                    <div key={index} className="border border-gray-200 p-2 sm:p-3 rounded bg-gray-50">
                                                        <div className="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-2 gap-1 sm:gap-2">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-1 sm:mr-2 border border-gray-300"
                                                                    style={{ backgroundColor: (variant.colorName || '').toLowerCase() }}
                                                                ></div>
                                                                <span className="font-medium text-xs sm:text-sm">{variant.colorName || 'No color name'}</span>
                                                            </div>
                                                            <span className="sm:ml-auto text-xs sm:text-sm">Stock: {variant.stock || 0}</span>
                                                        </div>
                                                        {variant.thumbnail && (
                                                            <img
                                                                src={variant.thumbnail}
                                                                alt={`${variant.colorName} thumbnail`}
                                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded mb-1 sm:mb-2"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/100?text=Thumbnail';
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <h4 className="text-xs font-medium mb-1">Sizes:</h4>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(variant.sizes || []).map((size, sizeIndex) => (
                                                                    <span key={sizeIndex} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        {size.size || 'N/A'}: {size.stock || 0}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        {/* Load More Button */}
                        {hasMore && !searchTerm && (
                            <div className="flex justify-center mt-4 sm:mt-6">
                                <button
                                    onClick={loadMoreProducts}
                                    disabled={loading}
                                    className={`px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </span>
                                    ) : (
                                        'Load More Products'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* No more products message */}
                        {!hasMore && !searchTerm && products.length > 0 && (
                            <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                                You've reached the end of the product list.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductUpdate;