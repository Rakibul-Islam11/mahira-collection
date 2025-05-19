import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firbase.config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [shippingLocation, setShippingLocation] = useState('inside');
    const [shippingCharge, setShippingCharge] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [productsData, setProductsData] = useState({});
    const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);
    const navigate = useNavigate();

    const formatPrice = (price) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return Math.floor(num).toLocaleString('en-US');
    };

    // Toast notification functions
    const showToast = (icon, title, text) => {
        MySwal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: title,
            text: text,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    };

    const showSuccessToast = (message) => {
        showToast('success', 'Success!', message);
    };

    const showErrorToast = (message) => {
        showToast('error', 'Error!', message);
    };

    const showWarningToast = (message) => {
        showToast('warning', 'Warning!', message);
    };

    const showConfirmationDialog = (title, text, confirmButtonText) => {
        return MySwal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: confirmButtonText,
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn'
            }
        });
    };

    const showOrderCompleteDialog = () => {
        return MySwal.fire({
            title: 'Order Completed!',
            text: 'Your order has been placed successfully!',
            icon: 'success',
            confirmButtonText: 'Continue Shopping',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            customClass: {
                popup: 'swal-wide'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage'));
                navigate('/');
            }
        });
    };

    const showOrderCancelDialog = () => {
        return MySwal.fire({
            title: 'Order Cancelled',
            text: 'Your order has been cancelled',
            icon: 'info',
            confirmButtonText: 'Continue Shopping',
            confirmButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/');
            }
        });
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const validatedCart = cart.map(item => ({
                ...item,
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                deliveryCharge: typeof item.deliveryCharge === 'undefined' ? true : item.deliveryCharge
            }));

            setCartItems(validatedCart);

            const productsInfo = {};
            for (const item of validatedCart) {
                try {
                    const productRef = doc(db, 'products', item.productId);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists()) {
                        productsInfo[item.productId] = productSnap.data();
                    }
                } catch (error) {
                    console.error('Error fetching product data:', error);
                    showErrorToast('Failed to load product information');
                }
            }

            setProductsData(productsInfo);
            fetchShippingCharges();
            setIsLoading(false);
        };

        fetchCartItems();

        const handleCartUpdate = (event) => {
            if (event.detail) {
                setCartItems(event.detail);
            } else {
                const updatedCartFromStorage = JSON.parse(localStorage.getItem('cart')) || [];
                setCartItems(updatedCartFromStorage);
            }
            fetchShippingCharges();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

    const fetchShippingCharges = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockData = { coxbazar: 50, outOfCoxbazar: 100 };

            const hasDeliveryCharge = cartItems.some(item => {
                const productData = productsData[item.productId];
                return (productData?.deliveryCharge === true ||
                    (typeof productData?.deliveryCharge === 'undefined' &&
                        (item.deliveryCharge === true || typeof item.deliveryCharge === 'undefined')));
            });

            const charge = hasDeliveryCharge
                ? (shippingLocation === 'inside' ? mockData.coxbazar : mockData.outOfCoxbazar)
                : 0;

            setShippingCharge(charge);
        } catch (error) {
            console.error('Error fetching shipping charges:', error);
            const hasDeliveryCharge = cartItems.some(item => {
                const productData = productsData[item.productId];
                return (productData?.deliveryCharge === true ||
                    (typeof productData?.deliveryCharge === 'undefined' &&
                        (item.deliveryCharge === true || typeof item.deliveryCharge === 'undefined')));
            });
            setShippingCharge(hasDeliveryCharge ? (shippingLocation === 'inside' ? 50 : 100) : 0);
        }
    };

    useEffect(() => {
        fetchShippingCharges();
    }, [shippingLocation, cartItems, productsData]);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedCart = cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );

        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event('storage'));
        showSuccessToast('Quantity updated successfully');
    };

    const removeItem = async (id) => {
        const itemToRemove = cartItems.find(item => item.id === id);
        if (!itemToRemove) return;

        const result = await showConfirmationDialog(
            'Remove Item',
            `Are you sure you want to remove ${itemToRemove.name} from your cart?`,
            'Yes, remove it'
        );

        if (result.isConfirmed) {
            const updatedCart = cartItems.filter(item => item.id !== id);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            setCartItems(updatedCart);
            window.dispatchEvent(new Event('storage'));
            showSuccessToast('Item removed from cart');
        }
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
        return Math.floor(subtotal + shippingCharge - discount);
    };

    const handleShippingChange = (e) => {
        setShippingLocation(e.target.value);
        showSuccessToast('Shipping location updated');
    };

    const handleCouponApply = async () => {
        if (!couponCode.trim()) {
            setCouponMessage('Please enter a coupon code');
            showErrorToast('Please enter a coupon code');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockResponse = {
                valid: couponCode.toLowerCase() === 'save20',
                discountAmount: couponCode.toLowerCase() === 'save20' ? 20 : 0,
                message: couponCode.toLowerCase() === 'save20' ? 'Coupon applied!' : 'Invalid coupon code'
            };

            if (mockResponse.valid) {
                setDiscount(mockResponse.discountAmount);
                setCouponMessage(`Coupon applied! Discount: ৳${formatPrice(mockResponse.discountAmount)}`);
                showSuccessToast('Coupon applied successfully!');
            } else {
                setDiscount(0);
                setCouponMessage(mockResponse.message);
                showErrorToast('Invalid coupon code');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            setCouponMessage('Failed to apply coupon. Please try again.');
            showErrorToast('Failed to apply coupon');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceedToCheckout = async () => {
        if (cartItems.length === 0) {
            showErrorToast('Your cart is empty');
            return;
        }

        const result = await showConfirmationDialog(
            'Confirm Checkout',
            'Are you sure you want to proceed to checkout?',
            'Yes, proceed'
        );

        if (result.isConfirmed) {
            setIsCheckoutProcessing(true);

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));

                const checkoutData = {
                    cartItems: cartItems.map(item => ({
                        ...item,
                        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
                    })),
                    shipping: {
                        location: shippingLocation,
                        charge: shippingCharge
                    },
                    coupon: {
                        code: couponCode,
                        discount: discount
                    }
                };

                localStorage.setItem('checkoutState', JSON.stringify(checkoutData));
                navigate('/checkout', { state: checkoutData });
                showSuccessToast('Redirecting to checkout...');
            } catch (error) {
                showErrorToast('Failed to process checkout. Please try again.');
                console.error('Checkout error:', error);
            } finally {
                setIsCheckoutProcessing(false);
            }
        }
    };

    if (isLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const hasDeliveryChargeItems = cartItems.some(item => {
        const productData = productsData[item.productId];
        return (productData?.deliveryCharge === true ||
            (typeof productData?.deliveryCharge === 'undefined' &&
                (item.deliveryCharge === true || typeof item.deliveryCharge === 'undefined')));
    });

    const freeShippingProducts = cartItems.filter(item => {
        const productData = productsData[item.productId];
        return productData?.deliveryCharge === false || item.deliveryCharge === false;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        Your Shopping Cart
                    </h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-500">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                        <svg
                            className="mx-auto h-16 sm:h-20 w-16 sm:w-20 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-medium text-gray-900">Your cart is empty</h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">Start adding some items to your cart</p>
                        <div className="mt-3 sm:mt-4">
                            <Link
                                to="/"
                                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-6 xl:gap-x-8">
                        {/* Cart items */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map((item) => {
                                        const price = typeof item.price === 'number' ? item.price :
                                            typeof item.price === 'string' ? parseFloat(item.price) : 0;
                                        const itemTotal = Math.floor(price) * item.quantity;
                                        const productData = productsData[item.productId];
                                        const hasFreeDelivery = productData?.deliveryCharge === false || item.deliveryCharge === false;

                                        return (
                                            <li key={item.id} className="py-3 px-3 sm:px-4 border-b border-gray-200 last:border-b-0">
                                                <div className="flex gap-3">
                                                    {/* Product Image */}
                                                    <div className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-md overflow-hidden">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover object-center"
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between">
                                                            <div className="pr-2">
                                                                <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">
                                                                    {item.name}
                                                                </h3>

                                                                {/* Color and Size */}
                                                                {item.color?.name && (
                                                                    <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                                                                        Color: <span className="capitalize">{item.color.name}</span>
                                                                    </p>
                                                                )}
                                                                {item.size?.size && (
                                                                    <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">
                                                                        Size: <span className="uppercase">{item.size.size}</span>
                                                                    </p>
                                                                )}
                                                                {hasFreeDelivery && (
                                                                    <p className="mt-0.5 text-[10px] sm:text-xs text-green-600">
                                                                        Free Delivery
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Remove Button */}
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="text-gray-400 hover:text-red-500 h-5 flex-shrink-0"
                                                                aria-label="Remove item"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4 sm:h-5 sm:w-5"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>

                                                        {/* Price and Quantity */}
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                                                                ৳{formatPrice(price)}
                                                            </p>

                                                            {/* Quantity Selector */}
                                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-gray-600 hover:bg-gray-50"
                                                                >
                                                                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                                <span className="px-1 sm:px-2 text-xs sm:text-sm text-gray-900 min-w-[20px] sm:min-w-[30px] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-gray-600 hover:bg-gray-50"
                                                                >
                                                                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        {/* Order summary */}
                        <div className="mt-4 sm:mt-6 lg:mt-0 lg:col-span-5 xl:col-span-4">
                            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-5 md:p-6">
                                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>

                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-xs sm:text-sm md:text-base text-gray-600">Subtotal</span>
                                        <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900">
                                            ৳{formatPrice(calculateSubtotal())}
                                        </span>
                                    </div>

                                    {hasDeliveryChargeItems ? (
                                        <>
                                            <div className="border-t border-gray-200 pt-2 sm:pt-3">
                                                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Shipping Location</h3>
                                                <div className="space-y-1 sm:space-y-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            id="inside"
                                                            name="shipping"
                                                            type="radio"
                                                            value="inside"
                                                            checked={shippingLocation === 'inside'}
                                                            onChange={handleShippingChange}
                                                            className="h-3 w-3 sm:h-4 sm:w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <label
                                                            htmlFor="inside"
                                                            className="ml-2 block text-xs sm:text-sm text-gray-700"
                                                        >
                                                            Inside Cox's Bazar
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            id="outside"
                                                            name="shipping"
                                                            type="radio"
                                                            value="outside"
                                                            checked={shippingLocation === 'outside'}
                                                            onChange={handleShippingChange}
                                                            className="h-3 w-3 sm:h-4 sm:w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <label
                                                            htmlFor="outside"
                                                            className="ml-2 block text-xs sm:text-sm text-gray-700"
                                                        >
                                                            Outside Cox's Bazar
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-xs sm:text-sm md:text-base text-gray-600">Shipping</span>
                                                <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900">
                                                    ৳{formatPrice(shippingCharge)}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-green-600">
                                            <span className="text-xs sm:text-sm md:text-base">Shipping</span>
                                            <span className="text-xs sm:text-sm md:text-base font-medium">Free</span>
                                        </div>
                                    )}

                                    {/* Display free shipping products */}
                                    {freeShippingProducts.length > 0 && (
                                        <div className="border-t border-gray-200 pt-2 sm:pt-3">
                                            <p className="text-xs sm:text-sm text-green-600 mb-1">You got free shipping for:</p>
                                            <ul className="text-xs sm:text-sm text-gray-600">
                                                {freeShippingProducts.map((product) => (
                                                    <li key={product.id} className="flex items-start">
                                                        <span className="mr-1">•</span>
                                                        <span className="line-clamp-1">{product.name}</span>
                                                        {product.size?.size && (
                                                            <span className="ml-1 text-gray-500">(Size: {product.size.size})</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-2 sm:pt-3">
                                        <label htmlFor="coupon" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Coupon Code
                                        </label>
                                        <div className="flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                id="coupon"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md text-xs sm:text-sm border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 border"
                                                placeholder="Enter coupon code"
                                            />
                                            <button
                                                onClick={handleCouponApply}
                                                disabled={isLoading}
                                                className="-ml-px relative inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isLoading ? (
                                                    <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    'Apply'
                                                )}
                                            </button>
                                        </div>
                                        {couponMessage && (
                                            <p className={`mt-1 text-xs sm:text-sm ${discount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {couponMessage}
                                            </p>
                                        )}
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600 text-xs sm:text-sm md:text-base">
                                            <span>Discount</span>
                                            <span>-৳{formatPrice(discount)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-2 sm:pt-3">
                                        <div className="flex justify-between text-sm sm:text-base md:text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>৳{formatPrice(calculateTotal())}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 sm:mt-4">
                                        <button
                                            onClick={handleProceedToCheckout}
                                            disabled={isCheckoutProcessing}
                                            className="w-full flex justify-center items-center px-3 sm:px-4 py-1.5 sm:py-2 md:py-3 border border-transparent rounded-md shadow-sm text-xs sm:text-sm md:text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                                        >
                                            {isCheckoutProcessing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                'Proceed to Checkout'
                                            )}
                                        </button>
                                    </div>

                                    <div className="mt-2 sm:mt-3 flex justify-center text-xs sm:text-sm text-center text-gray-500">
                                        <p>
                                            or{' '}
                                            <Link
                                                to="/"
                                                className="text-blue-600 font-medium hover:text-blue-500"
                                            >
                                                Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;