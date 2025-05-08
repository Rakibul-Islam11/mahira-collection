import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import navbrandIMG from '../../assets/images/Untitled design (1).png';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MainNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (menu) => {
        setOpenDropdown(prev => prev === menu ? null : menu);
    };

    return (
        <header className="bg-white border-y border-gray-200 play-regular">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <Link to="/" className="text-gray-700 hover:text-black">Home</Link>

                        <div className="group relative">
                            <Link to="/category/men" className="text-gray-700 hover:text-black">Men</Link>
                            <div className="absolute hidden group-hover:block bg-white shadow-md py-2 px-4 space-y-2 z-20 min-w-[200px] whitespace-nowrap">
                                <Link to="/category/men/watch" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Watch</Link>
                                <Link to="/category/men/luxury-brands" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Luxury Brands</Link>
                                <Link to="/category/men/shoes" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Shoes</Link>
                                <Link to="/category/men/polo" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Polo</Link>
                                <Link to="/category/men/shirt" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Shirt</Link>
                                <Link to="/category/men/pants" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Pants</Link>
                                <Link to="/category/men/panjabi" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Panjabi</Link>
                            </div>
                        </div>

                        <div className="group relative">
                            <Link to="/category/women" className="text-gray-700 hover:text-black">Women</Link>
                            <div className="absolute hidden group-hover:block bg-white shadow-md py-2 px-4 space-y-2 z-20 min-w-[200px] whitespace-nowrap">
                                <Link to="/category/women/bag" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Bag</Link>
                                <Link to="/category/women/shoes" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Shoes</Link>
                                <Link to="/category/women/jewellery" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Jewellery</Link>
                                <Link to="/category/women/chinese-dresses" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Chinese Dresses</Link>
                                <Link to="/category/women/deshi-dresses" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Deshi Dresses</Link>
                                <Link to="/category/women/watch" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Watch</Link>
                                <Link to="/category/women/cosmetics" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Cosmetics</Link>
                            </div>
                        </div>

                        <Link to="/category/kids" className="text-gray-700 hover:text-black">Kids</Link>
                    </div>

                    {/* Brand */}
                    <div className="flex justify-center items-center z-50">
                        <Link to="/">
                            <img
                                src={navbrandIMG}
                                alt="Brand Logo"
                                className="h-[120px] md:h-[190px] w-auto"
                            />
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <div className="group relative">
                            <Link to="/all-categories" className="text-gray-700 hover:text-black">All Category</Link>
                            <div className="absolute right-[-100px] top-[20px] hidden group-hover:flex bg-white shadow-md py-4 px-6 pt-10 space-x-8 z-20">
                                {/* Men Categories */}
                                <div className="min-w-[200px] whitespace-nowrap">
                                    <h3 className="font-semibold text-gray-800 mb-2">Men</h3>
                                    <div className="space-y-1">
                                        <Link to="/category/men/watch" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Watch</Link>
                                        <Link to="/category/men/luxury-brands" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Luxury Brands</Link>
                                        <Link to="/category/men/shoes" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Shoes</Link>
                                        <Link to="/category/men/polo" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Polo</Link>
                                        <Link to="/category/men/shirt" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Shirt</Link>
                                        <Link to="/category/men/pants" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Pants</Link>
                                        <Link to="/category/men/panjabi" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Panjabi</Link>
                                    </div>
                                </div>

                                {/* Women Categories */}
                                <div className="min-w-[200px] whitespace-nowrap">
                                    <h3 className="font-semibold text-gray-800 mb-2">Women</h3>
                                    <div className="space-y-1">
                                        <Link to="/category/women/bag" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Bag</Link>
                                        <Link to="/category/women/shoes" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Shoes</Link>
                                        <Link to="/category/women/jewellery" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Jewellery</Link>
                                        <Link to="/category/women/chinese-dresses" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Chinese Dresses</Link>
                                        <Link to="/category/women/deshi-dresses" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Deshi Dresses</Link>
                                        <Link to="/category/women/watch" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Watch</Link>
                                        <Link to="/category/women/cosmetics" className="block px-2 py-1 hover:bg-gray-100 hover:text-black rounded">Cosmetics</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link to="/orders" className="text-gray-700 hover:text-black">Orders</Link>
                        <Link to="/cart" className="text-gray-700 hover:text-black">
                            <ShoppingCart size={20} />
                        </Link>
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
                    <Link to="/" className="block font-semibold">Home</Link>

                    {/* Men Dropdown */}
                    <div>
                        <button
                            onClick={() => toggleDropdown('men')}
                            className="flex justify-between items-center w-full font-semibold text-left"
                        >
                            Men
                            {openDropdown === 'men' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {openDropdown === 'men' && (
                            <div className="ml-4 mt-2 space-y-1">
                                <Link to="/category/men/shirt" className="block">Shirt</Link>
                                <Link to="/category/men/pants" className="block">Pants</Link>
                                <Link to="/category/men/panjabi" className="block">Panjabi</Link>
                                <Link to="/category/men/polo" className="block">Polo</Link>
                                <Link to="/category/men/shoes" className="block">Shoes</Link>
                                <Link to="/category/men/watch" className="block">Watch</Link>
                                <Link to="/category/men/luxury-brands" className="block">Luxury Brands</Link>
                            </div>
                        )}
                    </div>

                    {/* Women Dropdown */}
                    <div>
                        <button
                            onClick={() => toggleDropdown('women')}
                            className="flex justify-between items-center w-full font-semibold text-left"
                        >
                            Women
                            {openDropdown === 'women' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {openDropdown === 'women' && (
                            <div className="ml-4 mt-2 space-y-1">
                                <Link to="/category/women/deshi-dresses" className="block">Deshi Dresses</Link>
                                <Link to="/category/women/chinese-dresses" className="block">Chinese Dresses</Link>
                                <Link to="/category/women/jewellery" className="block">Jewellery</Link>
                                <Link to="/category/women/watch" className="block">Watch</Link>
                                <Link to="/category/women/cosmetics" className="block">Cosmetics</Link>
                                <Link to="/category/women/bag" className="block">Bag</Link>
                                <Link to="/category/women/shoes" className="block">Shoes</Link>
                            </div>
                        )}
                    </div>

                    <Link to="/category/kids" className="block font-semibold">Kids</Link>
                    <Link to="/orders" className="block font-semibold">Orders</Link>
                    <Link to="/cart" className="flex items-center space-x-2">
                        <ShoppingCart size={20} />
                        <span>Cart</span>
                    </Link>

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