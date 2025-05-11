import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [shippingLocation, setShippingLocation] = useState('inside');
    const [shippingCharge, setShippingCharge] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);
        fetchShippingCharges();
        setIsLoading(false);
    }, []);

    const fetchShippingCharges = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockData = { coxbazar: 50, outOfCoxbazar: 100 };
            setShippingCharge(shippingLocation === 'inside' ? mockData.coxbazar : mockData.outOfCoxbazar);
        } catch (error) {
            console.error('Error fetching shipping charges:', error);
            setShippingCharge(shippingLocation === 'inside' ? 50 : 100);
        }
    };

    useEffect(() => {
        fetchShippingCharges();
    }, [shippingLocation]);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedCart = cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );

        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event('storage'));
    };

    const removeItem = (id) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event('storage'));
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return (subtotal + shippingCharge - discount).toFixed(2);
    };

    const handleShippingChange = (e) => {
        setShippingLocation(e.target.value);
    };

    const handleCouponApply = async () => {
        if (!couponCode.trim()) {
            setCouponMessage('Please enter a coupon code');
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
                setCouponMessage(`Coupon applied! Discount: ৳${mockResponse.discountAmount}`);
            } else {
                setDiscount(0);
                setCouponMessage(mockResponse.message);
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            setCouponMessage('Failed to apply coupon. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Your Shopping Cart
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-500">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-20 w-20 text-gray-400"
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
                        <h2 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h2>
                        <p className="mt-1 text-gray-500">Start adding some items to your cart</p>
                        <div className="mt-4">
                            <Link
                                to="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12">
                        {/* Cart items - more compact design */}
                        <div className="lg:col-span-7">
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="p-3 sm:p-4">
                                            <div className="flex items-start sm:items-center">
                                                {/* Compact image */}
                                                <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-md overflow-hidden">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                </div>

                                                <div className="ml-4 flex-1 min-w-0">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                                                {item.name}
                                                            </h3>
                                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                ৳{item.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="ml-2 text-gray-400 hover:text-red-500"
                                                        >
                                                            <svg
                                                                className="h-5 w-5"
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

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="flex items-center border border-gray-300 rounded-md">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="px-2 py-1 sm:px-3 sm:py-1 text-gray-600 hover:text-gray-800"
                                                            >
                                                                <span className="sr-only">Decrease quantity</span>
                                                                <svg
                                                                    className="h-4 w-4 sm:h-5 sm:w-5"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <span className="px-2 py-1 text-sm sm:text-base text-gray-900">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="px-2 py-1 sm:px-3 sm:py-1 text-gray-600 hover:text-gray-800"
                                                            >
                                                                <span className="sr-only">Increase quantity</span>
                                                                <svg
                                                                    className="h-4 w-4 sm:h-5 sm:w-5"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="text-sm sm:text-base font-medium text-gray-900">
                                                            ৳{(item.price * item.quantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Order summary - unchanged */}
                        <div className="mt-6 lg:mt-0 lg:col-span-5">
                            <div className="bg-white shadow-sm rounded-lg p-5 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                                        <span className="text-sm sm:text-base font-medium text-gray-900">
                                            ৳{calculateSubtotal().toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3">
                                        <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Shipping Location</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    id="inside"
                                                    name="shipping"
                                                    type="radio"
                                                    value="inside"
                                                    checked={shippingLocation === 'inside'}
                                                    onChange={handleShippingChange}
                                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
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
                                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
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
                                        <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                                        <span className="text-sm sm:text-base font-medium text-gray-900">
                                            ৳{shippingCharge.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3">
                                        <label htmlFor="coupon" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Coupon Code
                                        </label>
                                        <div className="flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                id="coupon"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 py-2 px-3 border text-xs sm:text-base"
                                                placeholder="Enter coupon code"
                                            />
                                            <button
                                                onClick={handleCouponApply}
                                                disabled={isLoading}
                                                className="-ml-px relative inline-flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700"
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
                                        <div className="flex justify-between text-green-600 text-sm sm:text-base">
                                            <span>Discount</span>
                                            <span>-৳{discount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>৳{calculateTotal()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            className="w-full flex justify-center items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-green-600 hover:bg-green-700"
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </div>

                                    <div className="mt-4 flex justify-center text-xs sm:text-sm text-center text-gray-500">
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