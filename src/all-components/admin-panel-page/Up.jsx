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
        price: '',
        productId: '',
        regularPrice: '',
        slug: '',
        stock: '',
        subcategory: [],
        tags: [],
        isColorVariant: false,
        colorVariants: [{
            colorName: '',
            images: [''],
            stock: '',
            thumbnail: '',
            isOutfit: false,
            sizes: [{ size: '', stock: '' }]
        }],
        images: [''],
        discount: '',
        gender: '',
        mainImage: '',
        isPreOrder: false,
        productType: '',
        preOrderDescription: '',
        deliveryCharge: ''
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle number inputs with validation
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        // Only allow numbers and empty string
        if (value === '' || /^[0-9\b]+$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
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

        // Handle number fields specifically
        if (field === 'stock') {
            if (value === '' || /^[0-9\b]+$/.test(value)) {
                updatedVariants[index][field] = value;
            }
        } else {
            updatedVariants[index][field] = field === 'isOutfit' ? value : value;
        }

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

        if (field === 'stock') {
            if (value === '' || /^[0-9\b]+$/.test(value)) {
                updatedVariants[variantIndex].sizes[sizeIndex][field] = value;
            }
        } else {
            updatedVariants[variantIndex].sizes[sizeIndex][field] = value;
        }

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
                    stock: '',
                    thumbnail: '',
                    isOutfit: false,
                    sizes: [{ size: '', stock: '' }]
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
        updatedVariants[variantIndex].sizes.push({ size: '', stock: '' });

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
            // Convert empty string number fields to 0
            const numberFields = ['price', 'regularPrice', 'discount', 'stock'];
            const processedData = { ...formData };

            numberFields.forEach(field => {
                processedData[field] = processedData[field] === '' ? 0 : Number(processedData[field]);
            });

            // Process color variants
            processedData.colorVariants = processedData.colorVariants.map(variant => {
                const newVariant = { ...variant };
                newVariant.stock = newVariant.stock === '' ? 0 : Number(newVariant.stock);

                if (newVariant.isOutfit) {
                    newVariant.sizes = newVariant.sizes.map(size => ({
                        ...size,
                        stock: size.stock === '' ? 0 : Number(size.stock)
                    }));
                }

                return newVariant;
            });

            // Prepare the product data to be saved
            const productData = {
                available: processedData.available,
                category: processedData.category,
                categoryId: processedData.categoryId,
                description: processedData.description,
                detailsImage: processedData.detailsImage,
                name: processedData.name,
                price: processedData.price,
                productId: processedData.productId,
                regularPrice: processedData.regularPrice,
                slug: processedData.slug,
                stock: processedData.stock,
                subcategory: processedData.subcategory,
                tags: processedData.tags,
                discount: processedData.discount,
                gender: processedData.gender,
                mainImage: processedData.mainImage,
                isColorVariants: processedData.isColorVariant,
                deliveryCharge: processedData.deliveryCharge === 'true',
                createdAt: new Date(),
                ...(processedData.isPreOrder && {
                    productType: 'pre-order',
                    preOrderDescription: processedData.preOrderDescription
                })
            };

            // Add color variants or images based on selection
            if (processedData.isColorVariant) {
                productData.colorVariants = processedData.colorVariants.map(variant => {
                    const { isOutfit, sizes, ...rest } = variant;
                    if (isOutfit) {
                        return { ...rest, sizes };
                    }
                    return rest;
                });
            } else {
                productData.images = processedData.images;
            }

            // Create document reference with custom ID
            const docRef = doc(db, processedData.collectionName, processedData.documentName);

            // Set the document with the product data
            await setDoc(docRef, productData);

            console.log('Document written with ID: ', processedData.documentName);
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
                price: '',
                productId: '',
                regularPrice: '',
                slug: '',
                stock: '',
                subcategory: [],
                tags: [],
                isColorVariant: false,
                colorVariants: [{
                    colorName: '',
                    images: [''],
                    stock: '',
                    thumbnail: '',
                    isOutfit: false,
                    sizes: [{ size: '', stock: '' }]
                }],
                images: [''],
                discount: '',
                gender: '',
                mainImage: '',
                isPreOrder: false,
                productType: '',
                preOrderDescription: '',
                deliveryCharge: ''
            }));

        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Error uploading product!');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Product Upload Form</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                {/* Section 1: Collection & Document Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Collection & Document Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Collection Name <span className="text-red-500">*</span>
                                <span className="text-xs text-red-500 block">(name must be, "products")</span>
                            </label>
                            <input
                                type="text"
                                name="collectionName"
                                value={formData.collectionName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Document ID <span className="text-red-500">*</span>
                                <span className="text-xs text-red-500 block">("should be must  camel case")</span>
                            </label>
                            <input
                                type="text"
                                name="documentName"
                                value={formData.documentName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Basic Product Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Basic Product Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID <span className="text-red-500">*</span>
                                <span className="text-xs text-red-500 block">(should match Document ID)</span>
                            </label>
                            <input
                                type="text"
                                name="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="unisex">Unisex</option>
                                <option value="kids">Kids</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Main Image URL <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-500 block">(Main product card image)</span>
                        </label>
                        <input
                            type="text"
                            name="mainImage"
                            value={formData.mainImage}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Charge <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="deliveryCharge"
                            value={formData.deliveryCharge}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                            <option value="">Select Delivery Option</option>
                            <option value="true">Apply Delivery Charge</option>
                            <option value="false">Free Delivery</option>
                        </select>
                    </div>
                </div>

                {/* Section 3: Pricing Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Pricing Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selling Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleNumberChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Regular Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="regularPrice"
                                value={formData.regularPrice}
                                onChange={handleNumberChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount (%)
                            </label>
                            <input
                                type="text"
                                name="discount"
                                value={formData.discount}
                                onChange={handleNumberChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Category & Classification */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Category & Classification</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                                <span className="text-xs text-gray-500 block">(e.g., "men", "women", "kids")</span>
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category ID <span className="text-red-500">*</span>
                                <span className="text-xs text-gray-500 block">(should match category name)</span>
                            </label>
                            <input
                                type="text"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subcategory
                            <span className="text-xs text-gray-500 block">(comma separated, e.g., "t-shirt, casual, summer, trending")</span>
                        </label>
                        <input
                            type="text"
                            name="subcategory"
                            value={formData.subcategory.join(', ')}
                            onChange={handleArrayChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                            <span className="text-xs text-gray-500 block">(comma separated, e.g., "new, trending, 2023")</span>
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags.join(', ')}
                            onChange={handleArrayChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>
                </div>

                {/* Section 5: Product Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Product Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Details Image URL
                            <span className="text-xs text-gray-500 block">(Additional product details image)</span>
                        </label>
                        <input
                            type="text"
                            name="detailsImage"
                            value={formData.detailsImage}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slug <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-500 block">(should be match product name, e.g., "bridal shopping bag")</span>
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="stock"
                                value={formData.stock}
                                onChange={handleNumberChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                        </div>
                        <div className="flex items-center mt-6">
                            <input
                                type="checkbox"
                                name="available"
                                checked={formData.available}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-2 block text-sm text-gray-700">Product Available</label>
                        </div>
                    </div>
                </div>

                {/* Section 6: Product Variants */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Product Variants</h2>

                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            name="isColorVariant"
                            checked={formData.isColorVariant}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm font-medium text-gray-700">This product has color variants</label>
                    </div>

                    {/* Color Variants Section */}
                    {formData.isColorVariant && (
                        <div className="space-y-4 border p-4 rounded-lg bg-white">
                            <h3 className="text-md font-medium text-gray-700">Color Variants</h3>

                            {formData.colorVariants.map((variant, variantIndex) => (
                                <div key={variantIndex} className="border p-4 rounded-lg space-y-3 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.colorName}
                                                onChange={(e) => handleColorVariantChange(variantIndex, 'colorName', e.target.value)}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stock <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.stock}
                                                onChange={(e) => handleColorVariantChange(variantIndex, 'stock', e.target.value)}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Thumbnail URL <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.thumbnail}
                                                onChange={(e) => handleColorVariantChange(variantIndex, 'thumbnail', e.target.value)}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            />
                                        </div>
                                    </div>

                                    {/* Outfit Checkbox */}
                                    <div className="flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            checked={variant.isOutfit}
                                            onChange={(e) => handleColorVariantChange(variantIndex, 'isOutfit', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">This variant has sizes</label>
                                    </div>

                                    {/* Sizes Section (when outfit is checked) */}
                                    {variant.isOutfit && (
                                        <div className="space-y-3 mt-3">
                                            <h4 className="text-sm font-medium text-gray-700">Size Information</h4>
                                            {variant.sizes.map((size, sizeIndex) => (
                                                <div key={sizeIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Size <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={size.size}
                                                            onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'size', e.target.value)}
                                                            required
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Stock <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={size.stock}
                                                            onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'stock', e.target.value)}
                                                            required
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                            pattern="[0-9]*"
                                                            inputMode="numeric"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSize(variantIndex, sizeIndex)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addSize(variantIndex)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                            >
                                                Add Size
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Images <span className="text-red-500">*</span>
                                        </label>
                                        {variant.images.map((image, imageIndex) => (
                                            <div key={imageIndex} className="flex items-center space-x-2 mt-2">
                                                <input
                                                    type="text"
                                                    value={image}
                                                    onChange={(e) => handleColorVariantImageChange(variantIndex, imageIndex, e.target.value)}
                                                    required
                                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeColorVariantImage(variantIndex, imageIndex)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addColorVariantImage(variantIndex)}
                                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                        >
                                            Add Image
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeColorVariant(variantIndex)}
                                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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
                        <div className="space-y-4 border p-4 rounded-lg bg-white">
                            <h3 className="text-md font-medium text-gray-700">Product Images</h3>

                            {formData.images.map((image, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={image}
                                        onChange={(e) => handleImagesChange(index, e.target.value)}
                                        required
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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
                </div>

                {/* Section 7: Pre-order Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Pre-order Information</h2>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            name="isPreOrder"
                            checked={formData.isPreOrder}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm font-medium text-gray-700">This is a pre-order product</label>
                    </div>

                    {formData.isPreOrder && (
                        <div className="space-y-4 border p-4 rounded-lg bg-white">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="productType"
                                    value={formData.productType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    required
                                >
                                    <option value="">Select Product Type</option>
                                    <option value="pre-order">Pre-order</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pre-order Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="preOrderDescription"
                                    value={formData.preOrderDescription}
                                    onChange={handleChange}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Upload Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Up;