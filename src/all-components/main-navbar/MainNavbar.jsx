import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, Search, Home, List, Phone, Package } from 'lucide-react';
import navbrandIMG from '../../assets/images/Untitled design (1).png';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firbase.config';
import CartSidebar from '../cart-sidebar-page/CartSidebar';


const MainNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false); // সাইডবার স্টেট
    const [cartItems, setCartItems] = useState([]); // কার্ট আইটেম স্টেট

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const q = query(collection(db, 'menu-categories'), orderBy('order'));
                const querySnapshot = await getDocs(q);

                const items = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() });
                });

                setMenuItems(items);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching menu items:", error);
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
            setCartItems(cart); // কার্ট আইটেম আপডেট করুন
        };

        // Initial load
        updateCartCount();

        // Add event listeners
        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    const toggleDropdown = (menu) => {
        setOpenDropdown(prev => prev === menu ? null : menu);
    };

    const openMobileMenu = () => {
        setIsMobileMenuOpen(true);
    };

    if (loading) {
        return <div className="bg-white border-y border-gray-200 h-16"></div>;
    }

    return (
        <>
            <header className="bg-white border-y border-gray-200 play-regular">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex justify-between items-center h-16">
                        {/* Left side - Desktop */}
                        <div className="flex space-x-6 items-center">
                            <Link to="/" className="text-gray-700 hover:text-black">Home</Link>

                            {menuItems.map((item) => (
                                item.type === 'dropdown' ? (
                                    <div key={item.id} className="group relative">
                                        <Link
                                            to={`/category/${item.id}`}
                                            className="text-gray-700 hover:text-black capitalize"
                                        >
                                            {item.id}
                                        </Link>
                                        <div className="absolute hidden group-hover:block bg-white shadow-md py-2 px-4 space-y-2 z-20 min-w-[200px] whitespace-nowrap">
                                            {item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.path}
                                                    to={`${subItem.path}`}
                                                    className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded capitalize"
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className="text-gray-700 hover:text-black capitalize"
                                    >
                                        {item.id}
                                    </Link>
                                )
                            ))}
                        </div>

                        {/* Brand Logo - Desktop */}
                        <div className="flex justify-center items-center z-50">
                            <Link to="/">
                                <img
                                    src={navbrandIMG}
                                    alt="Brand Logo"
                                    className="h-[190px] w-auto"
                                />
                            </Link>
                        </div>

                        {/* Right side - Desktop */}
                        <div className="flex space-x-6 items-center">
                            {/* All Categories Dropdown */}
                            <div className="group relative">
                                <Link to="/all-categories" className="text-gray-700 hover:text-black">All Category</Link>
                                <div className="absolute right-[-100px] top-[20px] hidden group-hover:flex bg-white shadow-md py-4 px-6 pt-10 space-x-8 z-20">
                                    {menuItems.filter(item => item.type === 'dropdown').map((category) => (
                                        <div key={category.id} className="min-w-[200px] whitespace-nowrap">
                                            <h3 className="font-semibold text-gray-800 mb-2 capitalize">{category.id}</h3>
                                            <div className="space-y-1">
                                                {category.items.map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={`${item.path}`}
                                                        className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded capitalize"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link to="/cart" className="text-gray-700 hover:text-black">Orders</Link>

                            {/* Cart Icon */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="text-gray-700 hover:text-black relative"
                            >
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Search */}
                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                                    className="text-gray-700 hover:text-black"
                                >
                                    <Search size={20} />
                                </button>
                                {isSearchOpen && (
                                    <div className="absolute top-full mt-2 z-50 right-0 bg-white border border-gray-200 shadow-md p-2 rounded">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            className="px-2 py-1 border border-gray-300 rounded w-48 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden flex justify-between items-center h-16">
                        {/* Hamburger Menu - Left */}
                        <div className="flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Brand Logo - Center */}
                        <div className="flex justify-center items-center z-50">
                            <Link to="/">
                                <img
                                    src={navbrandIMG}
                                    alt="Brand Logo"
                                    className="h-[120px] w-auto"
                                />
                            </Link>
                        </div>

                        {/* Search Icon - Right */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="text-gray-700 hover:text-black"
                            >
                                <Search size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4">
                        <Link to="/" className="block font-semibold">Home</Link>

                        {menuItems.map((item) => (
                            item.type === 'dropdown' ? (
                                <div key={item.id}>
                                    <button
                                        onClick={() => toggleDropdown(item.id)}
                                        className="flex justify-between items-center w-full font-semibold text-left capitalize"
                                    >
                                        {item.id}
                                        {openDropdown === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {openDropdown === item.id && (
                                        <div className="ml-4 mt-2 space-y-1">
                                            {item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.path}
                                                    to={`${subItem.path}`}
                                                    className="block capitalize"
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className="block font-semibold capitalize"
                                >
                                    {item.id}
                                </Link>
                            )
                        ))}

                        <Link to="/cart" className="block font-semibold">Orders</Link>

                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsCartOpen(true);
                            }}
                            className="flex items-center space-x-2 relative"
                        >
                            <ShoppingCart size={20} />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute left-4 -top-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <div>
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="flex items-center space-x-2 text-gray-700"
                            >
                                <Search size={20} />
                                <span>Search</span>
                            </button>
                            {isSearchOpen && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center h-16">
                    <Link to="/" className="flex flex-col items-center justify-center text-gray-700 hover:text-black p-2">
                        <Home size={20} />
                        <span className="text-xs mt-1">Home</span>
                    </Link>

                    <button
                        onClick={openMobileMenu}
                        className="flex flex-col items-center justify-center text-gray-700 hover:text-black p-2"
                    >
                        <List size={20} />
                        <span className="text-xs mt-1">Category</span>
                    </button>

                    <Link to="/cart" className="flex flex-col items-center justify-center text-gray-700 hover:text-black p-2">
                        <Package size={20} />
                        <span className="text-xs mt-1">Orders</span>
                    </Link>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex flex-col items-center justify-center text-gray-700 hover:text-black p-2 relative"
                    >
                        <ShoppingCart size={20} />
                        <span className="text-xs mt-1">Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <a href="tel:+1234567890" className="flex flex-col items-center justify-center text-gray-700 hover:text-black p-2">
                        <Phone size={20} />
                        <span className="text-xs mt-1">Call</span>
                    </a>
                </div>
            </div>

            {/* Cart Sidebar */}
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
            />
        </>
    );
};

export default MainNavbar;