import { useEffect, useState } from 'react';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartSidebar = ({ isOpen, onClose, cartItems }) => {
    const [localCartItems, setLocalCartItems] = useState(cartItems);

    useEffect(() => {
        setLocalCartItems(cartItems);
    }, [cartItems]);

    const formatPrice = (price) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return Math.floor(num).toLocaleString('en-US');
    };

    const calculateSubtotal = () => {
        return localCartItems.reduce((total, item) => {
            const price = typeof item.price === 'number' ? item.price :
                typeof item.price === 'string' ? parseFloat(item.price) : 0;
            return total + (Math.floor(price) * item.quantity);
        }, 0);
    };

    const removeItem = (id) => {
        const updatedCart = localCartItems.filter(item => item.id !== id);
        setLocalCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const updateQuantity = (id, change) => {
        const updatedCart = localCartItems.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + change;
                return { ...item, quantity: newQty > 0 ? newQty : 1 };
            }
            return item;
        });
        setLocalCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    return (
        <div className={`fixed inset-y-0 right-0 max-w-full flex z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl relative">
                    {/* Header */}
                    <div className="flex items-start justify-between px-4 py-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Shopping cart</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {localCartItems.length === 0 ? (
                            <div className="text-center mt-12">
                                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                                <p className="mt-1 text-sm text-gray-500">Start adding some items to your cart</p>
                                <div className="mt-6">
                                    <Link to="/" onClick={onClose} className="inline-flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-md shadow-sm">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <ul className="-my-6 divide-y divide-gray-200">
                                {localCartItems.map((item) => {
                                    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
                                    const itemTotal = Math.floor(price) * item.quantity;

                                    return (
                                        <li key={item.id} className="py-6 flex gap-4">
                                            <div className="w-24 h-24 flex-shrink-0 border rounded-md overflow-hidden">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between text-sm font-medium text-gray-900">
                                                        <h3>{item.name}</h3>
                                                        <p>৳{formatPrice(itemTotal)}</p>
                                                    </div>
                                                    {item.color?.name && (
                                                        <p className="text-sm text-gray-500">Color: <span className="capitalize">{item.color.name}</span></p>
                                                    )}
                                                    {item.size?.size && (
                                                        <p className="text-sm text-gray-500">Size: <span className="uppercase">{item.size.size}</span></p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 border rounded text-gray-600 hover:bg-gray-100">
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="text-sm">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 border rounded text-gray-600 hover:bg-gray-100">
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-500">
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {localCartItems.length > 0 && (
                        <div className="sticky bottom-0 bg-white border-t px-4 py-4">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <p>Subtotal</p>
                                <p>৳{formatPrice(calculateSubtotal())}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Shipping and taxes calculated at checkout.</p>
                            <div className="mt-4 flex flex-col gap-2">
                                <Link
                                    to="/cart"
                                    onClick={onClose}
                                    className="w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm text-sm font-medium"
                                >
                                    View Cart
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    Continue Shopping &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartSidebar;
