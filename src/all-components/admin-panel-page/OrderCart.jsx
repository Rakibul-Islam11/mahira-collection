import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Chart } from 'react-google-charts';
import { db } from '../../../firbase.config';

const OrderCart = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [newOrderCount, setNewOrderCount] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [monthlyStats, setMonthlyStats] = useState({
        confirmed: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        unknown: 0,
        chartData: [],
        cancelCount: 0 // নতুন কাউন্টার যোগ করা হয়েছে
    });
    const [processingOrders, setProcessingOrders] = useState({}); // লোডিং স্টেট ম্যানেজ করার জন্য

    // Determine order status based on orderStatus field and shipping status
    const determineOrderStatus = (order) => {
        if (order.cancelled === true) {
            return 'cancelled';
        }
        if (order.orderStatus === false) {
            return 'pending';
        }
        if (order.orderStatus === true) {
            return 'completed';
        }
        return order.shipping?.status || 'unknown';
    };

    // Filter orders based on status
    const filterOrders = (status) => {
        setActiveFilter(status);
        if (status === 'all') {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order => determineOrderStatus(order) === status);
            setFilteredOrders(filtered);
        }
    };

    // Function to update order status
    const updateOrderStatus = async (phoneNumber, orderId, statusUpdates) => {
        try {
            setProcessingOrders(prev => ({ ...prev, [`${phoneNumber}-${orderId}`]: true }));

            const orderRef = doc(db, 'orders', phoneNumber);
            const orderDoc = await getDoc(orderRef);

            if (orderDoc.exists()) {
                const orderData = orderDoc.data();

                if (orderData && orderData.orderInfo) {
                    const updatedOrders = orderData.orderInfo.map(order => {
                        if (order.orderId === orderId) {
                            return { ...order, ...statusUpdates };
                        }
                        return order;
                    });

                    await updateDoc(orderRef, {
                        orderInfo: updatedOrders
                    });

                    alert(`Order status updated successfully!`);
                }
            } else {
                alert('Order document not found!');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        } finally {
            setProcessingOrders(prev => ({ ...prev, [`${phoneNumber}-${orderId}`]: false }));
        }
    };

    // Function to mark order as completed
    const handleCompleteOrder = async (phoneNumber, orderId) => {
        await updateOrderStatus(phoneNumber, orderId, { orderStatus: true });
    };

    // Function to mark order as cancelled
    const handleCancelOrder = async (phoneNumber, orderId) => {
        await updateOrderStatus(phoneNumber, orderId, {
            cancelled: true,
            cancelledAt: new Date().toISOString()
        });
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef);

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const ordersData = [];
                    let cancelCount = 0; // ক্যানসেল কাউন্টার

                    snapshot.forEach((doc) => {
                        const orderDoc = doc.data();
                        if (orderDoc.orderInfo && Array.isArray(orderDoc.orderInfo)) {
                            orderDoc.orderInfo.forEach((order) => {
                                if (order.orderId && order.confirmedAt) {
                                    if (order.cancelled === true) {
                                        cancelCount++; // ক্যানসেল অর্ডার কাউন্ট করা
                                    }
                                    ordersData.push({
                                        id: order.orderId,
                                        phone: doc.id,
                                        ...order,
                                        shipping: order.shipping || { status: 'unknown', charge: 0 }
                                    });
                                }
                            });
                        }
                    });

                    ordersData.sort((a, b) => new Date(b.confirmedAt) - new Date(a.confirmedAt));
                    setOrders(ordersData);
                    setFilteredOrders(ordersData);

                    if (orders.length > 0 && ordersData.length > orders.length) {
                        const count = ordersData.length - orders.length;
                        setNewOrderCount(count);
                        setShowNotification(true);
                    }

                    calculateMonthlyStats(ordersData, cancelCount);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [orders.length]);

    const calculateMonthlyStats = (ordersData, cancelCount) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthlyOrders = ordersData.filter(order => {
            try {
                const orderDate = new Date(order.confirmedAt);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            } catch {
                return false;
            }
        });

        const statusCounts = monthlyOrders.reduce((acc, order) => {
            const status = determineOrderStatus(order);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const ordersByDay = monthlyOrders.reduce((acc, order) => {
            try {
                const orderDate = new Date(order.confirmedAt);
                const day = orderDate.getDate();

                if (!acc[day]) {
                    acc[day] = {
                        confirmed: 0,
                        pending: 0,
                        completed: 0,
                        cancelled: 0,
                        unknown: 0
                    };
                }

                const status = determineOrderStatus(order);
                acc[day][status] += 1;
                return acc;
            } catch {
                return acc;
            }
        }, {});

        const chartData = [
            ['Day', 'Confirmed', 'Pending', 'Completed', 'Cancelled', 'Unknown'],
            ...Object.entries(ordersByDay).map(([day, stats]) => [
                parseInt(day),
                stats.confirmed,
                stats.pending || 0,
                stats.completed || 0,
                stats.cancelled || 0,
                stats.unknown || 0
            ]).sort((a, b) => a[0] - b[0])
        ];

        setMonthlyStats({
            confirmed: statusCounts.confirmed || 0,
            pending: statusCounts.pending || 0,
            completed: statusCounts.completed || 0,
            cancelled: statusCounts.cancelled || 0,
            unknown: statusCounts.unknown || 0,
            chartData,
            cancelCount // ক্যানসেল কাউন্ট স্টেটে সেট করা
        });
    };

    const getStatusColor = (order) => {
        const status = determineOrderStatus(order);

        switch (status) {
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatusText = (order) => {
        const status = determineOrderStatus(order);
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateString) => {
        try {
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch {
            return 'Invalid date';
        }
    };

    const handleCloseNotification = () => {
        setShowNotification(false);
        setNewOrderCount(0);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* New Order Notification */}
            {showNotification && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="relative">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                            <span>
                                {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} received!
                            </span>
                            <button
                                onClick={handleCloseNotification}
                                className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {newOrderCount}
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Stats */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Monthly Order Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800">Confirmed</h3>
                        <p className="text-3xl font-bold">{monthlyStats.confirmed}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-yellow-800">Pending</h3>
                        <p className="text-3xl font-bold">{monthlyStats.pending}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800">Completed</h3>
                        <p className="text-3xl font-bold">{monthlyStats.completed}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-800">Cancelled</h3>
                        <p className="text-3xl font-bold">{monthlyStats.cancelled}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800">Unknown</h3>
                        <p className="text-3xl font-bold">{monthlyStats.unknown}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-800">Cancel Actions</h3>
                        <p className="text-3xl font-bold">{monthlyStats.cancelCount}</p>
                    </div>
                </div>

                <div className="h-64">
                    <Chart
                        width={'100%'}
                        height={'100%'}
                        chartType="ColumnChart"
                        loader={<div>Loading Chart</div>}
                        data={monthlyStats.chartData}
                        options={{
                            title: 'Daily Order Status',
                            chartArea: { width: '80%' },
                            hAxis: {
                                title: 'Day of Month',
                                minValue: 1,
                                maxValue: 31
                            },
                            vAxis: {
                                title: 'Number of Orders'
                            },
                            isStacked: true,
                            colors: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#9ca3af']
                        }}
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold">All Orders</h2>
                            <p className="text-gray-600">{filteredOrders.length} orders ({activeFilter === 'all' ? 'all' : activeFilter})</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                            <button
                                onClick={() => filterOrders('all')}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                            >
                                All ({orders.length})
                            </button>
                            <button
                                onClick={() => filterOrders('confirmed')}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                            >
                                Confirmed ({monthlyStats.confirmed})
                            </button>
                            <button
                                onClick={() => filterOrders('pending')}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                            >
                                Pending ({monthlyStats.pending})
                            </button>
                            <button
                                onClick={() => filterOrders('completed')}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'completed' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                            >
                                Completed ({monthlyStats.completed})
                            </button>
                            <button
                                onClick={() => filterOrders('cancelled')}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                            >
                                Cancelled ({monthlyStats.cancelled})
                            </button>
                            <button
                                onClick={() => filterOrders('unknown')}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'unknown' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                            >
                                Unknown ({monthlyStats.unknown})
                            </button>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No orders found</div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order.orderId} className="p-6 hover:bg-gray-50">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                                        <p className="text-gray-600">{formatDate(order.confirmedAt)}</p>
                                        {order.cancelledAt && (
                                            <p className="text-sm text-red-500">Cancelled at: {formatDate(order.cancelledAt)}</p>
                                        )}
                                    </div>
                                    <div className="mt-2 md:mt-0 flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order)}`}>
                                            {formatStatusText(order)}
                                        </span>
                                        {determineOrderStatus(order) === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCompleteOrder(order.phone, order.orderId)}
                                                    disabled={processingOrders[`${order.phone}-${order.orderId}`]}
                                                    className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                >
                                                    {processingOrders[`${order.phone}-${order.orderId}`] ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Processing
                                                        </>
                                                    ) : 'Complete'}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelOrder(order.phone, order.orderId)}
                                                    disabled={processingOrders[`${order.phone}-${order.orderId}`]}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                >
                                                    {processingOrders[`${order.phone}-${order.orderId}`] ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Processing
                                                        </>
                                                    ) : 'Cancel'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900">Customer Information</h4>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p>{order.customer?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p>{order.customer?.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="truncate">{order.customer?.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {order.customer?.notes && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">Notes</p>
                                            <p>{order.customer.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900">Order Details</h4>
                                    <div className="mt-2">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="py-3 border-b border-gray-100 last:border-0">
                                                <div className="flex items-start">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-16 h-16 object-cover rounded-md"
                                                        />
                                                    )}
                                                    <div className="ml-4 flex-1">
                                                        <h5 className="font-medium">{item.name || 'Unnamed item'}</h5>
                                                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                                                            {item.color && (
                                                                <span>Color: {item.color.name || item.color}</span>
                                                            )}
                                                            {item.size && (
                                                                <span>Size: {item.size.size || item.size}</span>
                                                            )}
                                                            <span>Qty: {item.quantity || 1}</span>
                                                            <span>Price: ৳{(item.price || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Payment</h4>
                                        <div className="mt-2">
                                            <p className="capitalize">
                                                {order.paymentMethod === 'bkash' ? 'bKash' : order.paymentMethod || 'Unknown'}
                                                {order.paymentDetails?.transactionId && (
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        (TrxID: {order.paymentDetails.transactionId})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span>৳{(order.subtotal || 0).toLocaleString()}</span>
                                        </div>
                                        {order.coupon?.discount > 0 && (
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-600">Coupon ({order.coupon.code})</span>
                                                <span className="text-red-500">-৳{(order.coupon.discount || 0).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-600">Shipping</span>
                                            <span>৳{(order.shipping?.charge || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-1 font-medium border-t border-gray-200 mt-2 pt-2">
                                            <span>Total</span>
                                            <span>৳{(order.total || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCart;