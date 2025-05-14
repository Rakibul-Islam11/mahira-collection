import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Chart } from 'react-google-charts';
import { db } from '../../../firbase.config';

const OrderCart = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newOrderCount, setNewOrderCount] = useState(0);
    const [monthlyStats, setMonthlyStats] = useState({
        confirmed: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        unknown: 0,
        chartData: []
    });

    // Determine order status based on orderStatus field and shipping status
    const determineOrderStatus = (order) => {
        if (order.orderStatus === false) {
            return 'pending';
        }
        if (order.orderStatus === true) {
            return 'completed';
        }
        return order.shipping?.status || 'unknown';
    };

    // Function to mark order as completed
    const handleCompleteOrder = async (phoneNumber, orderId) => {
        try {
            // Get the order document reference
            const orderRef = doc(db, 'orders', phoneNumber);

            // Get the current order data
            const orderDoc = await getDoc(orderRef);

            if (orderDoc.exists()) {
                const orderData = orderDoc.data();

                if (orderData && orderData.orderInfo) {
                    // Find and update the specific order
                    const updatedOrders = orderData.orderInfo.map(order => {
                        if (order.orderId === orderId) {
                            return { ...order, orderStatus: true };
                        }
                        return order;
                    });

                    // Update the document in Firestore
                    await updateDoc(orderRef, {
                        orderInfo: updatedOrders
                    });

                    alert('Order marked as completed successfully!');
                }
            } else {
                alert('Order document not found!');
            }
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Failed to complete order. Please try again.');
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef);

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const ordersData = [];
                    snapshot.forEach((doc) => {
                        const orderDoc = doc.data();
                        if (orderDoc.orderInfo && Array.isArray(orderDoc.orderInfo)) {
                            orderDoc.orderInfo.forEach((order) => {
                                // Ensure order has required fields
                                if (order.orderId && order.confirmedAt) {
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

                    // Sort by confirmedAt (newest first)
                    ordersData.sort((a, b) => new Date(b.confirmedAt) - new Date(a.confirmedAt));
                    setOrders(ordersData);

                    // Calculate new orders since last fetch
                    if (orders.length > 0 && ordersData.length > orders.length) {
                        setNewOrderCount(ordersData.length - orders.length);
                        setTimeout(() => setNewOrderCount(0), 5000);
                    }

                    calculateMonthlyStats(ordersData);
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

    const calculateMonthlyStats = (ordersData) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filter orders for current month
        const monthlyOrders = ordersData.filter(order => {
            try {
                const orderDate = new Date(order.confirmedAt);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            } catch {
                return false;
            }
        });

        // Count by status
        const statusCounts = monthlyOrders.reduce((acc, order) => {
            const status = determineOrderStatus(order);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Prepare chart data by day
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

        // Convert to array for chart
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
            chartData
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

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* New Order Notification */}
            {newOrderCount > 0 && (
                <div className="fixed top-4 right-4 animate-bounce">
                    <div className="relative">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                            {newOrderCount} new order{newOrderCount > 1 ? 's' : ''} received!
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                    <h2 className="text-2xl font-bold">All Orders</h2>
                    <p className="text-gray-600">{orders.length} total orders</p>
                </div>

                <div className="divide-y divide-gray-200">
                    {orders.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No orders found</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.orderId} className="p-6 hover:bg-gray-50">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                                        <p className="text-gray-600">{formatDate(order.confirmedAt)}</p>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order)}`}>
                                            {formatStatusText(order)}
                                        </span>
                                        {determineOrderStatus(order) === 'pending' && (
                                            <button
                                                onClick={() => handleCompleteOrder(order.phone, order.orderId)}
                                                className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                                            >
                                                Complete Order
                                            </button>
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