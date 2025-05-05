import { useState } from 'react';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import navbrandIMG from '../../assets/images/Untitled design (1).png'

const MainNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <header className="bg-white border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <a href="#" className="text-gray-700 hover:text-black">Home</a>

                        <div className="group relative">
                            <button className="text-gray-700 hover:text-black">Men</button>
                            <div className="absolute hidden group-hover:block bg-white shadow-md py-2 px-4 space-y-2 z-20">
                                <a href="#" className="block hover:text-black">Shirts</a>
                                <a href="#" className="block hover:text-black">Pants</a>
                                <a href="#" className="block hover:text-black">Accessories</a>
                            </div>
                        </div>

                        <div className="group relative">
                            <button className="text-gray-700 hover:text-black">Women</button>
                            <div className="absolute hidden group-hover:block bg-white shadow-md py-2 px-4 space-y-2 z-20">
                                <a href="#" className="block hover:text-black">Dresses</a>
                                <a href="#" className="block hover:text-black">Tops</a>
                                <a href="#" className="block hover:text-black">Accessories</a>
                            </div>
                        </div>

                        <a href="#" className="text-gray-700 hover:text-black">Kids</a>
                    </div>

                    {/* Brand */}
                    <div className="flex justify-center items-center">
                        <img
                            src={navbrandIMG}
                            alt="Brand Logo"
                            className="h-[120px] md:h-[190px] w-auto"
                        />
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <div className="group relative">
                            <button className="text-gray-700 hover:text-black">All Category</button>
                            <div className="absolute right-0 hidden group-hover:block bg-white shadow-md py-2 px-4 space-y-2 z-20">
                                <a href="#" className="block hover:text-black">Electronics</a>
                                <a href="#" className="block hover:text-black">Fashion</a>
                                <a href="#" className="block hover:text-black">Home & Kitchen</a>
                            </div>
                        </div>
                        <a href="#" className="text-gray-700 hover:text-black">Orders</a>
                        <a href="#" className="text-gray-700 hover:text-black">
                            <ShoppingCart size={20} />
                        </a>
                        <div className="relative flex items-center">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="text-gray-700 hover:text-black"
                            >
                                <Search size={20} />
                            </button>
                            {isSearchOpen && (
                                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 shadow-md p-2 rounded">
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
                    <a href="#" className="block">Home</a>

                    <div>
                        <span className="font-semibold">Men</span>
                        <div className="ml-4 space-y-1">
                            <a href="#" className="block">Shirts</a>
                            <a href="#" className="block">Pants</a>
                            <a href="#" className="block">Accessories</a>
                        </div>
                    </div>

                    <div>
                        <span className="font-semibold">Women</span>
                        <div className="ml-4 space-y-1">
                            <a href="#" className="block">Dresses</a>
                            <a href="#" className="block">Tops</a>
                            <a href="#" className="block">Accessories</a>
                        </div>
                    </div>

                    <a href="#" className="block">Kids</a>

                    <div>
                        <span className="font-semibold">All Category</span>
                        <div className="ml-4 space-y-1">
                            <a href="#" className="block">Electronics</a>
                            <a href="#" className="block">Fashion</a>
                            <a href="#" className="block">Home & Kitchen</a>
                        </div>
                    </div>

                    <a href="#" className="block">Orders</a>

                    <a href="#" className="block flex items-center space-x-2">
                        <ShoppingCart size={20} />
                        <span>Cart</span>
                    </a>

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
