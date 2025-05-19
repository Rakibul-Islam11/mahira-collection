import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { collection, getDocs } from 'firebase/firestore';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        notes: '',
        agreeTerms: false,
        paymentMethod: 'cash'
    });
    const [errors, setErrors] = useState({});
    const [hasAnyProductWithType, setHasAnyProductWithType] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Get checkout state with proper fallback
    const getCheckoutState = () => {
        if (location.state) {
            localStorage.setItem('checkoutState', JSON.stringify(location.state));
            return location.state;
        }

        const savedState = localStorage.getItem('checkoutState');
        if (savedState) {
            return JSON.parse(savedState);
        }

        return {
            cartItems: [],
            shipping: { location: 'inside', charge: 0 },
            coupon: { code: '', discount: 0 }
        };
    };

    const { cartItems, shipping, coupon } = getCheckoutState();

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    useEffect(() => {
        const checkProductTypes = async () => {
            try {
                const productsRef = collection(db, 'products');
                const snapshot = await getDocs(productsRef);

                const cartProductIds = cartItems.map(item => item.id);
                let foundAnyProductWithType = false;

                snapshot.forEach(doc => {
                    if (cartProductIds.includes(doc.id)) {
                        if (doc.data().productType) {
                            foundAnyProductWithType = true;
                        }
                    }
                });

                setHasAnyProductWithType(foundAnyProductWithType);
                setFormData(prev => ({
                    ...prev,
                    paymentMethod: foundAnyProductWithType ? 'bkash' : 'cash'
                }));
                setLoadingProducts(false);
            } catch (error) {
                console.error('Error checking product types:', error);
                setLoadingProducts(false);
            }
        };

        if (cartItems.length > 0) {
            checkProductTypes();
        } else {
            setLoadingProducts(false);
        }
    }, [cartItems]);

    const formatPrice = (price) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return Math.floor(num).toLocaleString('en-US');
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const price = typeof item.price === 'number' ? item.price :
                typeof item.price === 'string' ? parseFloat(item.price) : 0;
            return total + (Math.floor(price) * item.quantity);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return Math.floor(subtotal + shipping.charge - coupon.discount);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid Bangladeshi phone number';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.trim().length < 10) {
            newErrors.address = 'Address should be at least 10 characters';
        }

        if (formData.notes.length > 100) {
            newErrors.notes = 'Notes should not exceed 100 characters';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Prepare order data
        const orderData = {
            customer: {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                notes: formData.notes
            },
            items: cartItems,
            shipping: shipping,
            coupon: coupon,
            subtotal: calculateSubtotal(),
            total: calculateTotal(),
            paymentMethod: formData.paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Navigate to CompleteOrder with all data
        navigate('/complete-order', {
            state: {
                orderData,
                hasAnyProductWithType
                
            }
        });
    };

    
    
    if (loadingProducts) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading payment options...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        Checkout
                    </h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-500">
                        Complete your purchase
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-6 xl:gap-x-8">
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden p-4 sm:p-5 md:p-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
                                Customer Information
                            </h2>

                            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                                <div className="space-y-5 md:space-y-6">
                                    {/* Payment Method Section */}
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <label className="block text-sm md:text-base font-medium text-gray-800 mb-3">
                                            Payment Method <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-3">
                                            {hasAnyProductWithType ? (
                                                <div className="flex items-start">
                                                    <div className="flex items-center h-5 mt-0.5">
                                                        <input
                                                            id="payment-bkash"
                                                            name="paymentMethod"
                                                            type="radio"
                                                            value="bkash"
                                                            checked={formData.paymentMethod === 'bkash'}
                                                            onChange={handleChange}
                                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            required
                                                        />
                                                    </div>
                                                    <label htmlFor="payment-bkash" className="ml-3 block text-sm md:text-base text-gray-700">
                                                        <span className="font-medium">bKash Payment</span>
                                                        <p className="text-gray-500 text-xs md:text-sm mt-1">Required for selected products</p>
                                                    </label>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-start">
                                                        <div className="flex items-center h-5 mt-0.5">
                                                            <input
                                                                id="payment-cash"
                                                                name="paymentMethod"
                                                                type="radio"
                                                                value="cash"
                                                                checked={formData.paymentMethod === 'cash'}
                                                                onChange={handleChange}
                                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <label htmlFor="payment-cash" className="ml-3 block text-sm md:text-base text-gray-700">
                                                            <span className="font-medium">Cash on Delivery</span>
                                                            <p className="text-gray-500 text-xs md:text-sm mt-1">Pay when you receive your order</p>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <div className="flex items-center h-5 mt-0.5">
                                                            <input
                                                                id="payment-bkash"
                                                                name="paymentMethod"
                                                                type="radio"
                                                                value="bkash"
                                                                checked={formData.paymentMethod === 'bkash'}
                                                                onChange={handleChange}
                                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <label htmlFor="payment-bkash" className="ml-3 block text-sm md:text-base text-gray-700">
                                                            <span className="font-medium">bKash Payment</span>
                                                            <p className="text-gray-500 text-xs md:text-sm mt-1">Faster order processing</p>
                                                        </label>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {hasAnyProductWithType && (
                                            <>
                                                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-800">
                                                    <p className="font-medium">Important Notice:</p>
                                                    <p className="mt-1">এখানে শুধু মাত্র pre-order product এর জন্য আপনাকে অবশ্যই পূর্বে পেমেন্ট করতে হবে। আর cart এ যদি non pre-order product থাকে তাহলে বাকি product গুলির জন্য cash on delivery দিতে চাইলে অনুগ্রহ করে product name গুলি order note এ mention করুন।</p>
                                                </div>
                                                <div className="mt-2 text-xs md:text-sm text-gray-600">
                                                    Note: Some products in your cart require bKash payment.
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Personal Information Section */}
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-5 md:space-y-6">
                                        {/* Name Field */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-800">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="mt-1 relative">
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`block w-full rounded-md py-2 px-3 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm text-sm md:text-base`}
                                                    placeholder="Your full name"
                                                />
                                                {errors.name && (
                                                    <p className="mt-1 text-xs md:text-sm text-red-600">{errors.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone Field with English-only input */}
                                        <div>
                                            <label htmlFor="phone" className="block text-sm md:text-base font-medium text-gray-800">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 text-sm md:text-base">+88</span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        // Allow only English numerals (0-9)
                                                        const englishNumbers = e.target.value.replace(/[^0-9]/g, '');
                                                        handleChange({
                                                            target: {
                                                                name: 'phone',
                                                                value: englishNumbers
                                                            }
                                                        });
                                                    }}
                                                    maxLength={11}
                                                    placeholder="01XXXXXXXXX"
                                                    className={`block w-full pl-12 rounded-md py-2 px-3 border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm text-sm md:text-base`}
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="mt-1 text-xs md:text-sm text-red-600">{errors.phone}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">Must be 11 digits (e.g. 01712345678) with only english</p>
                                        </div>

                                        {/* Address Field */}
                                        <div>
                                            <label htmlFor="address" className="block text-sm md:text-base font-medium text-gray-800">
                                                Delivery Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="mt-1">
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    rows={3}
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className={`block w-full rounded-md py-2 px-3 border ${errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm text-sm md:text-base`}
                                                    placeholder="House #, Road #, Area, District"
                                                />
                                                {errors.address && (
                                                    <p className="mt-1 text-xs md:text-sm text-red-600">{errors.address}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Notes */}
                                        <div>
                                            <label htmlFor="notes" className="block text-sm md:text-base font-medium text-gray-800">
                                                Order Notes (Optional)
                                            </label>
                                            <div className="mt-1">
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    rows={2}
                                                    value={formData.notes}
                                                    onChange={handleChange}
                                                    className={`block w-full rounded-md py-2 px-3 border ${errors.notes ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm text-sm md:text-base`}
                                                    placeholder="Any special instructions for your order..."
                                                    maxLength={100}
                                                />
                                                <div className="flex justify-between mt-1">
                                                    {errors.notes && (
                                                        <p className="text-xs md:text-sm text-red-600">{errors.notes}</p>
                                                    )}
                                                    <p className={`text-xs ${formData.notes.length > 100 ? 'text-red-600' : 'text-gray-500'} ml-auto`}>
                                                        {formData.notes.length}/100 characters
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms and Submit Section */}
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="agreeTerms"
                                                    name="agreeTerms"
                                                    type="checkbox"
                                                    checked={formData.agreeTerms}
                                                    onChange={handleChange}
                                                    className={`h-4 w-4 rounded ${errors.agreeTerms ? 'border-red-300 text-red-600 focus:ring-red-500' : 'border-gray-300 text-blue-600 focus:ring-blue-500'} focus:ring-2`}
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="agreeTerms" className="text-sm md:text-base font-medium text-gray-800">
                                                    I agree to the <a href="/terms-condition" className="text-blue-600 hover:text-blue-800 underline">Terms and Conditions</a> <span className="text-red-500">*</span>
                                                </label>
                                                {errors.agreeTerms && (
                                                    <p className="mt-1 text-xs md:text-sm text-red-600">{errors.agreeTerms}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <button
                                                type="submit"
                                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                            >
                                                Place Order
                                            </button>
                                            {errors.submit && (
                                                <p className="mt-3 text-sm text-red-600 text-center">{errors.submit}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6 lg:mt-0 lg:col-span-5 xl:col-span-4">
                        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-5 md:p-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">Order Summary</h2>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="border-b border-gray-200 pb-3 sm:pb-4">
                                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">
                                        {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                                    </h3>
                                    <ul className="divide-y divide-gray-200">
                                        {cartItems.map((item) => {
                                            const price = typeof item.price === 'number' ? item.price :
                                                typeof item.price === 'string' ? parseFloat(item.price) : 0;
                                            const itemTotal = Math.floor(price) * item.quantity;

                                            return (
                                                <li key={item.id} className="py-2 sm:py-3 flex justify-between">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-2 sm:mr-3">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover object-center"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.quantity} × ৳{formatPrice(price)}
                                                            </p>
                                                            {item.size?.size && (
                                                                <p className="text-[10px] text-gray-500">
                                                                    Size: {item.size.size}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                                                        ৳{formatPrice(itemTotal)}
                                                    </p>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                                        <span className="text-sm sm:text-base font-medium text-gray-900">
                                            ৳{formatPrice(calculateSubtotal())}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                                        <span className="text-sm sm:text-base font-medium text-gray-900">
                                            {shipping.charge > 0 ? (
                                                `৳${formatPrice(shipping.charge)} (${shipping.location === 'inside' ? 'Inside Cox\'s Bazar' : 'Outside Cox\'s Bazar'})`
                                            ) : (
                                                <span className="text-green-600">Free</span>
                                            )}
                                        </span>
                                    </div>

                                    {coupon.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span className="text-sm sm:text-base">Discount</span>
                                            <span className="text-sm sm:text-base font-medium">
                                                -৳{formatPrice(coupon.discount)}
                                                {coupon.code && ` (${coupon.code})`}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-2 sm:pt-3">
                                        <div className="flex justify-between text-sm sm:text-base md:text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>৳{formatPrice(calculateTotal())}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;