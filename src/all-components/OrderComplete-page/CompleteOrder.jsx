import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firbase.config';
import { doc, setDoc, getDoc, arrayUnion, updateDoc, increment } from 'firebase/firestore';

const CompleteOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderData } = location.state || {};
    const [paymentDetails, setPaymentDetails] = useState({
        bkashNumber: '',
        transactionId: ''
    });
    const [paymentErrors, setPaymentErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    if (!orderData) {
        navigate('/checkout');
        return null;
    }

    const formatPrice = (price) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return Math.floor(num).toLocaleString('en-US');
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails({
            ...paymentDetails,
            [name]: value
        });

        if (paymentErrors[name]) {
            setPaymentErrors({
                ...paymentErrors,
                [name]: ''
            });
        }
    };

    const validatePayment = () => {
        const newErrors = {};

        if (!paymentDetails.bkashNumber.trim()) {
            newErrors.bkashNumber = 'bKash number is required';
        } else if (!/^01[3-9]\d{8}$/.test(paymentDetails.bkashNumber)) {
            newErrors.bkashNumber = 'Please enter a valid bKash number';
        }

        if (!paymentDetails.transactionId.trim()) {
            newErrors.transactionId = 'Transaction ID is required';
        } else if (paymentDetails.transactionId.trim().length < 8) {
            newErrors.transactionId = 'Transaction ID should be at least 8 characters';
        }

        setPaymentErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateProductStock = async (items) => {
        try {
            const batchUpdates = [];
            console.log("Items to update:", items);

            for (const item of items) {
                const productRef = doc(db, 'products', item.id);
                const productDoc = await getDoc(productRef);

                if (!productDoc.exists()) {
                    console.warn(`Product not found: ${item.id}`);
                    continue;
                }

                const productData = productDoc.data();
                console.log(`Product data for ${item.id}:`, productData);
                let updates = {};

                if (item.color && item.size && productData.colorVariants) {
                    console.log(`Updating with color and size for ${item.id}`, item);
                    const updatedColorVariants = productData.colorVariants.map(colorVariant => {
                        // ... আপনার কোড ...
                        return colorVariant;
                    });
                    console.log("Updated color variants:", updatedColorVariants);
                    updates = {
                        colorVariants: updatedColorVariants,
                        stock: (productData.stock || 0) - item.quantity
                    };
                } else if (item.color && productData.colorVariants && !item.size) {
                    console.log(`Updating with only color for ${item.id}`, item);
                    const updatedColorVariants = productData.colorVariants.map(colorVariant => {
                        if (colorVariant.colorName === item.color.name) { // এখানে item.color.name ব্যবহার করা হয়েছে
                            return {
                                ...colorVariant,
                                stock: (colorVariant.stock || 0) - item.quantity
                            };
                        }
                        return colorVariant;
                    });
                    console.log("Updated color variants:", updatedColorVariants);
                    updates = {
                        colorVariants: updatedColorVariants,
                        stock: (productData.stock || 0) - item.quantity // Optional: update main stock
                    };
                } else {
                    console.log(`Updating regular product ${item.id}`, item);
                    updates = {
                        stock: (productData.stock || 0) - item.quantity
                    };
                }

                batchUpdates.push(updateDoc(productRef, updates));
            }

            await Promise.all(batchUpdates);
            console.log('All stock updates completed successfully');

        } catch (error) {
            console.error('Error updating product stock:', error);
            throw error;
        }
    };
    const sendOrderConfirmationSMS = async (orderId, customerPhone, customerName, items, total, paymentMethod) => {
        try {
            // গ্রাহকের জন্য SMS কন্টেন্ট
            const customerMessage = `dear ${customerName}, your id #${orderId} মোট: ৳${formatPrice(total)}। পণ্য: ${items.slice(0, 3).map(item => item.name).join(', ')}${items.length > 3 ? ` এবং আরো ${items.length - 3}টি` : ''}`;

            // অ্যাডমিনের জন্য SMS কন্টেন্ট
            const paymentStatus = paymentMethod === 'bkash' ? 'bKash পেমেন্ট' : 'ক্যাশ অন ডেলিভারি';
            const adminMessage = `নতুন অর্ডার #${orderId}\nগ্রাহক: ${customerName}\nমোবাইল: ${customerPhone}\nপণ্য: ${items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}\nমোট: ৳${formatPrice(total)}\nপেমেন্ট: ${paymentStatus}`;

            // SMS ডাটা প্রস্তুত করুন
            const smsData = {
                api_key: "9mLiwGgsLgr3riui2wfM",
                senderid: "8809617625817",
                messages: [
                    {
                        to: `880${customerPhone.replace(/^0/, '')}`,
                        message: customerMessage
                    },
                    {
                        to: "8801783694568",
                        message: adminMessage
                    }
                ]
            };

            const response = await fetch("https://bulksmsbd.net/api/smsapimany", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(smsData)
            });

            const result = await response.json();
            console.log("SMS API রেস্পন্স:", result);

            if (result.error_message) {
                throw new Error(result.error_message);
            }

            return result;
        } catch (error) {
            console.error("SMS পাঠানোর সময় ত্রুটি:", error);
        }
    };

    const handleCompleteOrder = async () => {
        if (orderData.paymentMethod === 'bkash') {
            if (!validatePayment()) {
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // First update product stocks
            await updateProductStock(orderData.items);

            // Then process the order
            const customerRef = doc(db, 'orders', orderData.customer.phone);
            const orderId = `${Date.now()}`.slice(-6);

            const orderToSave = {
                ...orderData,
                orderStatus: false,
                orderId: orderId,
                status: 'confirmed',
                confirmedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            if (orderData.paymentMethod === 'bkash') {
                orderToSave.paymentDetails = {
                    ...paymentDetails,
                    verified: false,
                    paidAt: new Date().toISOString()
                };
            }

            const docSnap = await getDoc(customerRef);

            if (docSnap.exists()) {
                await setDoc(customerRef, {
                    customerPhone: orderData.customer.phone,
                    customerName: orderData.customer.name,
                    orderInfo: arrayUnion(orderToSave),
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } else {
                await setDoc(customerRef, {
                    customerPhone: orderData.customer.phone,
                    customerName: orderData.customer.name,
                    orderInfo: [orderToSave],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            await sendOrderConfirmationSMS(
                orderId,
                orderData.customer.phone,
                orderData.customer.name,
                orderData.items,
                orderData.total,
                orderData.paymentMethod
            );

            localStorage.removeItem('cart');
            localStorage.removeItem('checkoutState');
            window.dispatchEvent(new Event('storage'));

            setOrderSuccess(true);
        } catch (error) {
            console.error('অর্ডার সম্পন্ন করতে ত্রুটি:', error);
            // Show error message to user
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">অর্ডার কনফার্ম হয়েছে!</h2>
                    <p className="text-gray-600 mb-4">
                        আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে। অর্ডার আইডি: <span className="font-medium">{orderData.customer.phone}</span>
                    </p>
                    <p className="text-gray-600 mb-6">
                        আমরা আপনার মোবাইল নম্বরে একটি কনফার্মেশন এসএমএস পাঠিয়েছি।
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    >
                        শপিং চালিয়ে যান
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        আপনার অর্ডার সম্পন্ন করুন
                    </h1>
                    <p className="mt-2 text-gray-600">
                        আপনার তথ্য পর্যালোচনা করে অর্ডার কনফার্ম করুন
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Order summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order summary */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">
                                    অর্ডার সামারি
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                                        {orderData.items.length} {orderData.items.length === 1 ? 'আইটেম' : 'আইটেমসমূহ'}
                                    </h3>
                                    <ul className="divide-y divide-gray-200">
                                        {orderData.items.map((item, index) => {
                                            const itemTotal = Math.floor(item.price) * item.quantity;
                                            return (
                                                <li key={index} className="py-4 flex justify-between">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover object-center"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {item.quantity} × ৳{formatPrice(item.price)}
                                                            </p>
                                                            {item.size?.size && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    সাইজ: {item.size.size}
                                                                </p>
                                                            )}
                                                            {item.color?.color && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    কালার: {item.color.color}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ৳{formatPrice(itemTotal)}
                                                    </p>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">সাবটোটাল</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            ৳{formatPrice(orderData.subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">ডেলিভারি চার্জ</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {orderData.shipping.charge > 0 ? (
                                                `৳${formatPrice(orderData.shipping.charge)} (${orderData.shipping.location === 'inside' ? 'কক্সবাজার শহরের ভিতরে' : 'কক্সবাজার শহরের বাইরে'})`
                                            ) : (
                                                <span className="text-green-600">ফ্রি</span>
                                            )}
                                        </span>
                                    </div>

                                    {orderData.coupon.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span className="text-sm">ডিসকাউন্ট</span>
                                            <span className="text-sm font-medium">
                                                -৳{formatPrice(orderData.coupon.discount)}
                                                {orderData.coupon.code && ` (${orderData.coupon.code})`}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex justify-between text-base font-bold text-gray-900">
                                            <span>মোট</span>
                                            <span>৳{formatPrice(orderData.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment details */}
                        {orderData.paymentMethod === 'bkash' && (
                            <div className="bg-white rounded-lg shadow-md border border-red-100 overflow-hidden">
                                <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                                    <h2 className="text-lg font-bold text-red-800 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        bKash পেমেন্ট ডিটেইলস (অত্যন্ত গুরুত্বপূর্ণ)
                                    </h2>
                                    <p className="mt-1 text-sm text-red-700">সাবধানতার সাথে সঠিক তথ্য প্রদান করুন</p>
                                </div>

                                <div className="px-6 py-4">
                                    <div className="space-y-5">
                                        {/* bKash Number Field */}
                                        <div>
                                            <label htmlFor="bkashNumber" className="block text-sm font-medium text-gray-900 mb-1">
                                                আপনার bKash নাম্বার <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-700 font-medium">+88</span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    id="bkashNumber"
                                                    name="bkashNumber"
                                                    value={paymentDetails.bkashNumber}
                                                    onChange={(e) => {
                                                        // Allow only English numerals (0-9)
                                                        const englishNumbers = e.target.value.replace(/[^0-9]/g, '');
                                                        handlePaymentChange({
                                                            target: {
                                                                name: 'bkashNumber',
                                                                value: englishNumbers
                                                            }
                                                        });
                                                    }}
                                                    maxLength={11}
                                                    placeholder="01XXXXXXXXX"
                                                    className={`block w-full pl-12 py-2.5 rounded-md border-2 ${paymentErrors.bkashNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium`}
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
                                                    onBlur={() => {
                                                        // Validate on blur
                                                        if (paymentDetails.bkashNumber && !/^01[3-9]\d{8}$/.test(paymentDetails.bkashNumber)) {
                                                            setPaymentErrors({
                                                                ...paymentErrors,
                                                                bkashNumber: "সঠিক ১১ ডিজিটের bKash নম্বর দিন (01XXXXXXXXX)"
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {paymentErrors.bkashNumber ? (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {paymentErrors.bkashNumber}
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    অবশ্যই 11 ডিজিটের সঠিক bKash নম্বর দিন (যেমন: 01712345678)
                                                </p>
                                            )}
                                        </div>

                                        {/* Transaction ID Field */}
                                        <div>
                                            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-900 mb-1">
                                                ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="transactionId"
                                                name="transactionId"
                                                value={paymentDetails.transactionId}
                                                onChange={handlePaymentChange}
                                                className={`block w-full py-2.5 px-3 rounded-md border-2 ${paymentErrors.transactionId ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium`}
                                                placeholder="ট্রানজেকশন আইডি লিখুন (যেমন: 8A7D6F5G4H)"
                                                onBlur={() => {
                                                    if (!paymentDetails.transactionId) {
                                                        setPaymentErrors({
                                                            ...paymentErrors,
                                                            transactionId: "ট্রানজেকশন আইডি দিন"
                                                        });
                                                    }
                                                }}
                                            />
                                            {paymentErrors.transactionId && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {paymentErrors.transactionId}
                                                </p>
                                            )}
                                        </div>

                                        {/* Payment Instructions */}
                                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                            <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                পেমেন্ট নির্দেশাবলী:
                                            </h3>
                                            <ol className="text-sm text-blue-700 space-y-2">
                                                <li className="flex">
                                                    <span className="font-bold mr-2">1.</span>
                                                    <span>bKash নম্বর: <strong className="text-blue-900">01783694568</strong> এ ৳{formatPrice(orderData.total)} পাঠান</span>
                                                </li>
                                                <li className="flex">
                                                    <span className="font-bold mr-2">2.</span>
                                                    <span>উপরে আপনার bKash নম্বর এবং সঠিক ট্রানজেকশন আইডি লিখুন</span>
                                                </li>
                                                <li className="flex">
                                                    <span className="font-bold mr-2">3.</span>
                                                    <span className="text-red-600 font-semibold">ভুল তথ্য দিলে আপনার পেমেন্ট গ্রহণ করা হবে না</span>
                                                </li>
                                            </ol>
                                        </div>

                                        {/* Verification Warning */}
                                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800">
                                            <p className="font-bold flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                গুরুত্বপূর্ণ নোট:
                                            </p>
                                            <p className="mt-1">আপনার পেমেন্ট যাচাই করার জন্য আমরা আপনার প্রদত্ত নম্বরে কল করতে পারি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column - Contact info and order button */}
                    <div className="space-y-6">
                        {/* Customer info */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">
                                    যোগাযোগ তথ্য
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">নাম</h3>
                                        <p className="mt-1 text-sm text-gray-900">{orderData.customer.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">মোবাইল</h3>
                                        <p className="mt-1 text-sm text-gray-900">+88{orderData.customer.phone}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">ঠিকানা</h3>
                                        <p className="mt-1 text-sm text-gray-900">{orderData.customer.address}</p>
                                    </div>
                                    {orderData.customer.notes && (
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">অর্ডার নোট</h3>
                                            <p className="mt-1 text-sm text-gray-900">{orderData.customer.notes}</p>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">পেমেন্ট পদ্ধতি</h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {orderData.paymentMethod === 'bkash' ? (
                                                <span className="inline-flex items-center">
                                                    <span className="mr-2">bKash পেমেন্ট</span>
                                                    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            ) : 'ক্যাশ অন ডেলিভারি'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Complete order button */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4">
                                <button
                                    onClick={handleCompleteOrder}
                                    disabled={isSubmitting}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            প্রসেসিং...
                                        </span>
                                    ) : (
                                        'অর্ডার সম্পন্ন করুন'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteOrder;