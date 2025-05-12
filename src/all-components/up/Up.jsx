import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firbase.config';

const Up = () => {
    // Main form state
    const [formData, setFormData] = useState({
        collectionName: '',
        documentName: '',
        available: false,
        category: '',
        categoryId: '',
        description: '',
        detailsImage: '',
        name: '',
        price: 0,
        productId: '',
        regularPrice: 0,
        slug: '',
        stock: 0,
        subcategory: [],
        tags: [],
        isColorVariant: false,
        colorVariants: [{
            colorName: '',
            images: [''],
            stock: 0,
            thumbnail: '',
            isOutfit: false,
            sizes: [{ size: '', stock: 0 }]
        }],
        images: [''],
        discount: 0,
        gender: '',
        mainImage: '',
        isPreOrder: false,
        productType: '',
        preOrderDescription: '',
        deliveryCharge: '' // নতুন ফিল্ড যোগ করা হয়েছে
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle number inputs
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    // Handle array inputs (tags, subcategory)
    const handleArrayChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value.split(',').map(item => item.trim())
        }));
    };

    // Handle color variant changes
    const handleColorVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants[index][field] = field === 'stock' || field === 'isOutfit' ?
            (field === 'isOutfit' ? value : Number(value)) : value;

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Handle color variant image changes
    const handleColorVariantImageChange = (variantIndex, imageIndex, value) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants[variantIndex].images[imageIndex] = value;

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Handle size changes for outfit
    const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants[variantIndex].sizes[sizeIndex][field] =
            field === 'stock' ? Number(value) : value;

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Add new color variant
    const addColorVariant = () => {
        setFormData(prev => ({
            ...prev,
            colorVariants: [
                ...prev.colorVariants,
                {
                    colorName: '',
                    images: [''],
                    stock: 0,
                    thumbnail: '',
                    isOutfit: false,
                    sizes: [{ size: '', stock: 0 }]
                }
            ]
        }));
    };

    // Remove color variant
    const removeColorVariant = (index) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants.splice(index, 1);

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Add new image to color variant
    const addColorVariantImage = (variantIndex) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants[variantIndex].images.push('');

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Remove image from color variant
    const removeColorVariantImage = (variantIndex, imageIndex) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants[variantIndex].images.splice(imageIndex, 1);

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Add new size to outfit
    const addSize = (variantIndex) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants[variantIndex].sizes.push({ size: '', stock: 0 });

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Remove size from outfit
    const removeSize = (variantIndex, sizeIndex) => {
        const updatedVariants = [...formData.colorVariants];
        updatedVariants[variantIndex].sizes.splice(sizeIndex, 1);

        setFormData(prev => ({
            ...prev,
            colorVariants: updatedVariants
        }));
    };

    // Handle images array changes
    const handleImagesChange = (index, value) => {
        const updatedImages = [...formData.images];
        updatedImages[index] = value;

        setFormData(prev => ({
            ...prev,
            images: updatedImages
        }));
    };

    // Add new image to images array
    const addImage = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, '']
        }));
    };

    // Remove image from images array
    const removeImage = (index) => {
        const updatedImages = [...formData.images];
        updatedImages.splice(index, 1);

        setFormData(prev => ({
            ...prev,
            images: updatedImages
        }));
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Prepare the product data to be saved
            const productData = {
                available: formData.available,
                category: formData.category,
                categoryId: formData.categoryId,
                description: formData.description,
                detailsImage: formData.detailsImage,
                name: formData.name,
                price: formData.price,
                productId: formData.productId,
                regularPrice: formData.regularPrice,
                slug: formData.slug,
                stock: formData.stock,
                subcategory: formData.subcategory,
                tags: formData.tags,
                discount: formData.discount,
                gender: formData.gender,
                mainImage: formData.mainImage,
                isColorVariants: formData.isColorVariant,
                deliveryCharge: formData.deliveryCharge === 'true', // স্ট্রিং থেকে বুলিয়ানে কনভার্ট
                createdAt: new Date(),
                ...(formData.isPreOrder && {
                    productType: 'pre-order',
                    preOrderDescription: formData.preOrderDescription
                })
            };

            // Add color variants or images based on selection
            if (formData.isColorVariant) {
                productData.colorVariants = formData.colorVariants.map(variant => {
                    const { isOutfit, sizes, ...rest } = variant;
                    if (isOutfit) {
                        return { ...rest, sizes };
                    }
                    return rest;
                });
            } else {
                productData.images = formData.images;
            }

            // Create document reference with custom ID
            const docRef = doc(db, formData.collectionName, formData.documentName);

            // Set the document with the product data
            await setDoc(docRef, productData);

            console.log('Document written with ID: ', formData.documentName);
            alert('Product uploaded successfully!');

            // Reset form (except collection and document names)
            setFormData(prev => ({
                ...prev,
                available: false,
                category: '',
                categoryId: '',
                description: '',
                detailsImage: '',
                name: '',
                price: 0,
                productId: '',
                regularPrice: 0,
                slug: '',
                stock: 0,
                subcategory: [],
                tags: [],
                isColorVariant: false,
                colorVariants: [{
                    colorName: '',
                    images: [''],
                    stock: 0,
                    thumbnail: '',
                    isOutfit: false,
                    sizes: [{ size: '', stock: 0 }]
                }],
                images: [''],
                discount: 0,
                gender: '',
                mainImage: '',
                isPreOrder: false,
                productType: '',
                preOrderDescription: '',
                deliveryCharge: '' // রিসেট করার সময় খালি স্ট্রিং সেট করা
            }));

        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Error uploading product!');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Upload Product to Firestore</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Collection and Document Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Collection Name</label>
                        <input
                            type="text"
                            name="collectionName"
                            value={formData.collectionName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Document Name</label>
                        <input
                            type="text"
                            name="documentName"
                            value={formData.documentName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Basic Product Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product ID</label>
                        <input
                            type="text"
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="unisex">Unisex</option>
                            <option value="kids">Kids</option>
                        </select>
                    </div>
                </div>

                {/* Main Image Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Main Image URL</label>
                    <input
                        type="text"
                        name="mainImage"
                        value={formData.mainImage}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                {/* Delivery Charge Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Charge</label>
                    <select
                        name="deliveryCharge"
                        value={formData.deliveryCharge}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Select Delivery Charge Option</option>
                        <option value="true">Apply Delivery Charge</option>
                        <option value="false">Free Delivery</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleNumberChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Regular Price</label>
                        <input
                            type="number"
                            name="regularPrice"
                            value={formData.regularPrice}
                            onChange={handleNumberChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleNumberChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category ID</label>
                        <input
                            type="text"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Subcategory (comma separated)</label>
                    <input
                        type="text"
                        name="subcategory"
                        value={formData.subcategory.join(', ')}
                        onChange={handleArrayChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags.join(', ')}
                        onChange={handleArrayChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Details Image URL</label>
                    <input
                        type="text"
                        name="detailsImage"
                        value={formData.detailsImage}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleNumberChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="available"
                            checked={formData.available}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Available</label>
                    </div>
                </div>

                {/* Color Variant Toggle */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isColorVariant"
                        checked={formData.isColorVariant}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Has Color Variants</label>
                </div>

                {/* Pre-order Section */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isPreOrder"
                        checked={formData.isPreOrder}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Pre-order Product</label>
                </div>

                {formData.isPreOrder && (
                    <div className="space-y-4 border p-4 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Type</label>
                            <select
                                name="productType"
                                value={formData.productType}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Product Type</option>
                                <option value="pre-order">Pre-order</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pre-order Description</label>
                            <textarea
                                name="preOrderDescription"
                                value={formData.preOrderDescription}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Color Variants Section */}
                {formData.isColorVariant && (
                    <div className="space-y-4 border p-4 rounded-lg">
                        <h3 className="text-lg font-medium">Color Variants</h3>

                        {formData.colorVariants.map((variant, variantIndex) => (
                            <div key={variantIndex} className="border p-4 rounded-lg space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Color Name</label>
                                        <input
                                            type="text"
                                            value={variant.colorName}
                                            onChange={(e) => handleColorVariantChange(variantIndex, 'colorName', e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => handleColorVariantChange(variantIndex, 'stock', e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                                        <input
                                            type="text"
                                            value={variant.thumbnail}
                                            onChange={(e) => handleColorVariantChange(variantIndex, 'thumbnail', e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Outfit Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={variant.isOutfit}
                                        onChange={(e) => handleColorVariantChange(variantIndex, 'isOutfit', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">Is Outfit (has sizes)</label>
                                </div>

                                {/* Sizes Section (when outfit is checked) */}
                                {variant.isOutfit && (
                                    <div className="space-y-3 mt-3">
                                        <h4 className="text-sm font-medium">Sizes</h4>
                                        {variant.sizes.map((size, sizeIndex) => (
                                            <div key={sizeIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Size</label>
                                                    <input
                                                        type="text"
                                                        value={size.size}
                                                        onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'size', e.target.value)}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                                                    <input
                                                        type="number"
                                                        value={size.stock}
                                                        onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'stock', e.target.value)}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSize(variantIndex, sizeIndex)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                    >
                                                        Remove Size
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addSize(variantIndex)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Add Size
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Images</label>
                                    {variant.images.map((image, imageIndex) => (
                                        <div key={imageIndex} className="flex items-center space-x-2 mt-2">
                                            <input
                                                type="text"
                                                value={image}
                                                onChange={(e) => handleColorVariantImageChange(variantIndex, imageIndex, e.target.value)}
                                                required
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeColorVariantImage(variantIndex, imageIndex)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addColorVariantImage(variantIndex)}
                                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Add Image
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeColorVariant(variantIndex)}
                                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Remove Variant
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addColorVariant}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Add Color Variant
                        </button>
                    </div>
                )}

                {/* Images Section (when no color variants) */}
                {!formData.isColorVariant && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Images</h3>

                        {formData.images.map((image, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={image}
                                    onChange={(e) => handleImagesChange(index, e.target.value)}
                                    required
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addImage}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Image
                        </button>
                    </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Upload Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Up;