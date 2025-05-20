import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, Search, Home, List, Phone, Package } from 'lucide-react';
import navbrandIMG from '../../assets/images/Screenshot_4-Photoroom-removebg-preview.png';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firbase.config';
import CartSidebar from '../cart-sidebar-page/CartSidebar';
import './main-nav.css'

const MainNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [products, setProducts] = useState([]);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const fullText = 'Mahira Collection';
    const firstChar = fullText.charAt(0);
    const restText = fullText.slice(1);

    const [displayedText, setDisplayedText] = useState(firstChar);
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout;

        if (!isDeleting && index < restText.length) {
            // টাইপিং ইফেক্ট
            timeout = setTimeout(() => {
                setDisplayedText(firstChar + restText.slice(0, index + 1));
                setIndex(index + 1);
            }, 100); // টাইপিং স্পিড
        } else if (!isDeleting && index === restText.length) {
            // পুরো টেক্সট প্রদর্শনের পর অপেক্ষা
            timeout = setTimeout(() => {
                setIsDeleting(true);
                setIndex(restText.length - 1);
            }, 2000); // 2 সেকেন্ড অপেক্ষা
        } else if (isDeleting && index >= 0) {
            // রিভার্স হাইডিং
            timeout = setTimeout(() => {
                setDisplayedText(firstChar + restText.slice(0, index));
                setIndex(index - 1);
            }, 150); // হাইডিং স্পিড
        } else if (isDeleting && index < 0) {
            // হাইডিং সম্পন্ন, পুনরায় টাইপিং শুরু
            timeout = setTimeout(() => {
                setIsDeleting(false);
                setIndex(0);
            }, 1000); // 1 সেকেন্ড অপেক্ষা
        }

        return () => clearTimeout(timeout);
    }, [index, isDeleting, restText, firstChar]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

        const fetchProducts = async () => {
            try {
                const productsRef = collection(db, 'products');
                const q = query(productsRef);
                const querySnapshot = await getDocs(q);

                const productsData = [];
                querySnapshot.forEach((doc) => {
                    productsData.push({ id: doc.id, ...doc.data() });
                });

                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchMenuItems();
        fetchProducts();
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
            setCartItems(cart);
        };

        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const queryLower = searchQuery.toLowerCase();
        const results = products.filter(product => {
            const nameMatch = product.id.toLowerCase().includes(queryLower);
            const tagsMatch = product.tags && product.tags.some(tag =>
                tag.toLowerCase().includes(queryLower)
            );
            return nameMatch || tagsMatch;
        });

        setSearchResults(results.slice(0, 5));
    }, [searchQuery, products]);

    const toggleDropdown = (menu) => {
        setOpenDropdown(prev => prev === menu ? null : menu);
    };

    const openMobileMenu = () => {
        setIsMobileMenuOpen(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            window.location.href = `/product/${searchResults[0].id}`;
        }
    };

    const toggleMobileSearch = () => {
        setMobileSearchOpen(!mobileSearchOpen);
        setSearchQuery('');
        setSearchResults([]);
    };

    if (loading) {
        return <div className="bg-pink-100 border-y border-gray-200 h-16"></div>;
    }

    return (
        <>
            <header className={`bg-[radial-gradient(circle,_rgba(135,206,250,0.9)_0%,_rgba(70,130,180,0.9)_100%)] border-y border-gray-200 play-regular sticky top-0 z-50 ${isSticky ? 'shadow-md' : ''}`}>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex justify-between items-center h-24">
                        {/* Left side - Desktop */}
                        <div className="flex space-x-6 items-center">
                            <Link
                                to="/"
                                className={`relative text-[20px] transition-colors duration-300 ${location.pathname === '/' ? 'text-pink-700 font-medium' : 'text-gray-700 hover:text-pink-700'}`}
                            >
                                Home
                                {location.pathname === '/' && (
                                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full"></span>
                                )}
                            </Link>

                            {menuItems.map((item) => (
                                item.type === 'dropdown' ? (
                                    <div key={item.id} className="group relative">
                                        <Link
                                            to={`/category/${item.id}`}
                                            className={`relative capitalize text-[20px] transition-colors duration-300 ${location.pathname.startsWith(`/category/${item.id}`)
                                                ? 'text-pink-700 font-medium'
                                                : 'text-gray-700 hover:text-pink-700'
                                                }`}
                                        >
                                            {item.id}
                                            {location.pathname.startsWith(`/category/${item.id}`) && (
                                                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full"></span>
                                            )}
                                        </Link>
                                        <div className="absolute hidden group-hover:block bg-white shadow-lg py-2 px-4 space-y-2 z-20 min-w-[200px] rounded-md border border-gray-100">
                                            {item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.path}
                                                    to={`${subItem.path}`}
                                                    className={`block px-2 py-1 rounded capitalize transition-colors duration-200 ${location.pathname === subItem.path
                                                        ? 'bg-pink-100 text-pink-700 font-medium'
                                                        : 'hover:bg-pink-50 hover:text-pink-700'
                                                        }`}
                                                >
                                                    {subItem.name}
                                                    {location.pathname === subItem.path && (
                                                        <span className="block w-1 h-1 bg-pink-500 rounded-full mt-1 mx-auto"></span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={`relative capitalize text-[20px] transition-colors duration-300 ${location.pathname === item.path
                                            ? 'text-pink-700 font-medium'
                                            : 'text-gray-700 hover:text-pink-700'
                                            }`}
                                    >
                                        {item.id}
                                        {location.pathname === item.path && (
                                            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full"></span>
                                        )}
                                    </Link>
                                )
                            ))}
                        </div>

                        {/* Brand Logo - Desktop */}
                        <div className="flex flex-col justify-center items-center z-50">
                            <Link to="/" className="flex flex-col items-center group">
                                <img
                                    src={navbrandIMG}
                                    alt="Brand Logo"
                                    className="h-[60px] w-auto"
                                />
                                <span className="typing-text mt-[-10px]">
                                    {displayedText}
                                </span>


                            </Link>
                        </div>

                        {/* Right side - Desktop */}
                        <div className="flex space-x-6 items-center">
                            {/* All Categories Dropdown */}
                            <div className="group relative">
                                <Link
                                    to="/all-categories"
                                    className={`relative text-[20px] transition-colors duration-300 ${location.pathname === '/all-categories'
                                        ? 'text-pink-700 font-medium'
                                        : 'text-gray-700 hover:text-pink-700'
                                        }`}
                                >
                                    All Category
                                    {location.pathname === '/all-categories' && (
                                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full"></span>
                                    )}
                                </Link>
                                <div className="absolute right-[-100px] top-[31px] hidden group-hover:flex bg-white shadow-lg py-4 px-6 pt-10 space-x-8 z-20 rounded-md border border-gray-100">
                                    {menuItems.filter(item => item.type === 'dropdown').map((category) => (
                                        <div key={category.id} className="min-w-[200px] whitespace-nowrap">
                                            <h3 className="font-semibold text-gray-800 mb-2 capitalize border-b border-gray-200 pb-2">
                                                {category.id}
                                            </h3>
                                            <div className="space-y-1">
                                                {category.items.map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={`${item.path}`}
                                                        className={`block px-2 py-1 rounded capitalize transition-colors duration-200 ${location.pathname === item.path
                                                            ? 'bg-pink-100 text-pink-700 font-medium'
                                                            : 'hover:bg-pink-50 hover:text-pink-700'
                                                            }`}
                                                    >
                                                        {item.name}
                                                        {location.pathname === item.path && (
                                                            <span className="inline-block w-1 h-1 bg-pink-500 rounded-full ml-1"></span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link
                                to="/cart"
                                className={`relative text-[20px] transition-colors duration-300 ${location.pathname === '/cart'
                                    ? 'text-pink-700 font-medium'
                                    : 'text-gray-700 hover:text-pink-700'
                                    }`}
                            >
                                Orders
                                {location.pathname === '/cart' && (
                                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full"></span>
                                )}
                            </Link>

                            {/* Cart Icon */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="text-gray-700 hover:text-pink-700 relative transition-colors duration-300"
                            >
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Search */}
                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                                    className={`text-gray-700 hover:text-pink-700 transition-colors duration-300 ${isSearchOpen ? 'text-pink-700' : ''
                                        }`}
                                >
                                    <Search size={20} />
                                </button>
                                {isSearchOpen && (
                                    <div className="absolute top-full mt-2 z-50 right-0 bg-white border border-gray-200 shadow-lg p-2 rounded-md w-64">
                                        <form onSubmit={handleSearchSubmit}>
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                autoFocus
                                            />
                                        </form>
                                        {searchResults.length > 0 && (
                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                {searchResults.map(product => (
                                                    <Link
                                                        key={product.id}
                                                        to={`/product/${product.id}`}
                                                        className="block px-3 py-2 hover:bg-pink-50 rounded-md text-sm transition-colors duration-200"
                                                        onClick={() => {
                                                            setIsSearchOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        {product.id}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        {searchQuery && searchResults.length === 0 && (
                                            <div className="mt-2 text-sm text-gray-500 px-3 py-2">
                                                No products found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden flex justify-between items-center h-16">
                        {/* Hamburger Menu - Left */}
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                    setMobileSearchOpen(false);
                                }}
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Brand Logo - Center */}
                        <div className="flex flex-col justify-center items-center z-50">
                            <Link to="/" className="flex flex-col items-center">
                                <img
                                    src={navbrandIMG}
                                    alt="Brand Logo"
                                    className="h-[50px] w-auto"
                                />
                                <span className="typing-text mt-[-10px] !text-[16px]">{displayedText}</span>
                            </Link>
                        </div>

                        {/* Search Icon - Right */}
                        <div className="flex items-center">
                            <button
                                onClick={toggleMobileSearch}
                                className="text-gray-700 hover:text-pink-700"
                            >
                                <Search size={24} />
                            </button>
                        </div>
                    </div>


                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && !mobileSearchOpen && (
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
                                <span className="absolute left-4 -top-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                )}
            </header>

            {/* Mobile Bottom Navigation */}
            {!mobileSearchOpen && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-pink-100 border-t border-gray-200 z-50">
                    <div className="flex justify-around items-center h-16">
                        <Link to="/" className="flex flex-col items-center justify-center text-gray-700 hover:text-pink-700 p-2">
                            <Home size={20} />
                            <span className="text-xs mt-1">Home</span>
                        </Link>

                        <button
                            onClick={openMobileMenu}
                            className="flex flex-col items-center justify-center text-gray-700 hover:text-pink-700 p-2"
                        >
                            <List size={20} />
                            <span className="text-xs mt-1">Category</span>
                        </button>

                        <Link to="/cart" className="flex flex-col items-center justify-center text-gray-700 hover:text-pink-700 p-2">
                            <Package size={20} />
                            <span className="text-xs mt-1">Orders</span>
                        </Link>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="flex flex-col items-center justify-center text-gray-700 hover:text-pink-700 p-2 relative"
                        >
                            <ShoppingCart size={20} />
                            <span className="text-xs mt-1">Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-2 bg-pink-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <a href="tel:+8801783694568" className="flex flex-col items-center justify-center text-gray-700 hover:text-pink-700 p-2">
                            <Phone size={20} />
                            <span className="text-xs mt-1">Call</span>
                        </a>
                    </div>
                </div>
            )}

            {/* Cart Sidebar */}
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
            />
            {/* Mobile Search Bar - Full Width */}
            {mobileSearchOpen && (
                <div className="md:hidden bg-white p-3 border-b border-gray-200">
                    <div className="relative">
                        <form onSubmit={handleSearchSubmit} className="flex items-center">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={toggleMobileSearch}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </form>
                        {searchResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md">
                                {searchResults.map(product => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="block px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                        onClick={() => {
                                            setMobileSearchOpen(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        {product.id}
                                    </Link>
                                ))}
                            </div>
                        )}
                        {searchQuery && searchResults.length === 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md px-4 py-2 text-gray-500">
                                No products found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default MainNavbar;