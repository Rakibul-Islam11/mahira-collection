import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import navbrandIMG from '../../assets/images/Untitled design (1).png';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firbase.config';


const MainNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const toggleDropdown = (menu) => {
        setOpenDropdown(prev => prev === menu ? null : menu);
    };

    if (loading) {
        return <div className="bg-white border-y border-gray-200 h-16"></div>;
    }

    return (
        <header className="bg-white border-y border-gray-200 play-regular">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Desktop */}
                    <div className="hidden md:flex space-x-6 items-center">
                        {/* Hardcoded Home Link */}
                        <Link to="/" className="text-gray-700 hover:text-black">Home</Link>

                        {/* Database Menu Items */}
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

                    {/* Brand Logo */}
                    <div className="flex justify-center items-center z-50">
                        <Link to="/">
                            <img
                                src={navbrandIMG}
                                alt="Brand Logo"
                                className="h-[120px] md:h-[190px] w-auto"
                            />
                        </Link>
                    </div>

                    {/* Right side - Desktop */}
                    <div className="hidden md:flex space-x-6 items-center">
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

                        {/* Hardcoded Orders Link */}
                        <Link to="/orders" className="text-gray-700 hover:text-black">Orders</Link>

                        {/* Cart Icon */}
                        <Link to="/cart" className="text-gray-700 hover:text-black">
                            <ShoppingCart size={20} />
                        </Link>

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

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4">
                    {/* Hardcoded Home Link */}
                    <Link to="/" className="block font-semibold">Home</Link>

                    {/* Database Menu Items */}
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

                    {/* Hardcoded Orders Link */}
                    <Link to="/orders" className="block font-semibold">Orders</Link>

                    {/* Cart Link */}
                    <Link to="/cart" className="flex items-center space-x-2">
                        <ShoppingCart size={20} />
                        <span>Cart</span>
                    </Link>

                    {/* Mobile Search */}
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
    );
};

export default MainNavbar;