import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firbase.config';

const OrderComplete = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [isStoring, setIsStoring] = useState(false);
    const [storeError, setStoreError] = useState(null);

    if (!state?.orderData) {
        navigate('/');
        return null;
    }

    const { orderData, contactNumber } = state;

    const handleCompleteOrder = async () => {
        setIsStoring(true);
        setStoreError(null);

        try {
            // Use contactNumber as document ID
            await setDoc(doc(db, 'orders', contactNumber), {
                ...orderData,
                status: 'confirmed', // Changing status to confirmed when actually stored
                orderStatus: false // Adding the boolean field as requested
            });

            // Redirect to home page after successful storage
            navigate('/');
        } catch (error) {
            console.error('Error storing order:', error);
            setStoreError('Failed to store order. Please contact support.');
        } finally {
            setIsStoring(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">Order Ready for Confirmation!</h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        Your order will be confirmed after clicking the button below.
                    </p>
                    {storeError && (
                        <p className="mt-2 text-sm text-red-600">{storeError}</p>
                    )}
                </div>

                <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Order Summary</h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Customer Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Name</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">{orderData.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Contact Number</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">{orderData.customer.contactNumber}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs sm:text-sm text-gray-500">Address</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">{orderData.customer.address}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs sm:text-sm text-gray-500">Order Note</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">
                                            {orderData.customer.orderNote}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Payment Method</h3>
                                <p className="text-sm sm:text-base text-gray-900 capitalize">
                                    {orderData.paymentMethod === 'bkash' ? 'bKash Payment Gateway' : 'Cash on Delivery'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Order Items</h3>
                                <div className="space-y-4">
                                    {orderData.items.map((item, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover object-center"
                                                />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <p className="text-sm sm:text-base font-medium text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.color && `Color: ${item.color}`} {item.size && `Size: ${item.size}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity} × ৳{item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="ml-4 text-sm sm:text-base font-medium text-gray-900">
                                                ৳{(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                                        <span className="text-sm sm:text-base font-medium text-gray-900">
                                            ৳{orderData.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                                        <span className="text-sm sm:text-base font-medium text-gray-900">
                                            ৳{orderData.shippingCharge.toFixed(2)}
                                        </span>
                                    </div>
                                    {orderData.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span className="text-sm sm:text-base">Discount</span>
                                            <span className="text-sm sm:text-base font-medium">
                                                -৳{orderData.discount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>৳{orderData.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 py-4 bg-gray-50 text-center">
                        <button
                            onClick={handleCompleteOrder}
                            disabled={isStoring}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {isStoring ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Storing Order...
                                </>
                            ) : (
                                'Complete Order'
                            )}
                        </button>
                        <p className="mt-3 text-xs sm:text-sm text-gray-500">
                            Click the button above to confirm your order
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-sm sm:text-base font-medium text-blue-600 hover:text-blue-500"
                    >
                        Back to Home <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderComplete;