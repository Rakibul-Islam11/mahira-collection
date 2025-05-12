import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock } from 'lucide-react';
import navbrandIMG from '../../assets/images/Untitled design (1).png'; // Make sure to import your image

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 text-gray-700 play-regular border-t border-gray-200 w-full">
            {/* Brand Logo Section - Full Width */}
            <div className="w-full bg-white py-6 flex justify-center border-b border-gray-200">
                <Link to="/" className="flex justify-center">
                    <img
                        src={navbrandIMG}
                        alt="Brand Logo"
                        className="h-[120px] w-auto md:h-[150px]"
                    />
                </Link>
            </div>

            {/* Main Footer Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* About Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">About Us</h3>
                            <p className="text-sm">
                                We are dedicated to providing the best products and services to our customers with quality and care.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                    <Facebook size={20} />
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                    <Twitter size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/" className="hover:text-gray-900 transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="hover:text-gray-900 transition-colors">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products" className="hover:text-gray-900 transition-colors">
                                        Products
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="hover:text-gray-900 transition-colors">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">
                                        Privacy Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start space-x-3">
                                    <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                                    <span>123 Street Name, City, Country</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail size={18} />
                                    <a href="mailto:info@example.com" className="hover:text-gray-900">
                                        info@example.com
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone size={18} />
                                    <a href="tel:+1234567890" className="hover:text-gray-900">
                                        +1 234 567 890
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Opening Hours</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} />
                                    <span>Monday - Friday: 9am - 8pm</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} />
                                    <span>Saturday: 10am - 6pm</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} />
                                    <span>Sunday: Closed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscribe to Our Newsletter</h3>
                            <div className="max-w-md mx-auto flex">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-gray-400"
                                />
                                <button className="bg-gray-800 text-white px-4 py-2 rounded-r hover:bg-gray-700 transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm">
                        <p>&copy; {currentYear} Your Company Name. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;