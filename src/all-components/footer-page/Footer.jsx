import { Link } from 'react-router-dom';
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    Clock,
    ChevronDown,
    ChevronUp,
    CreditCard
} from 'lucide-react';
import navbrandIMG from '../../assets/images/480353899_615347981104853_3842057109669510985_n (1).jpg';
import { useState } from 'react';
import bkashImg from '../../assets/images/BKash-bKash-Logo.wine.svg';
import nagadImg from '../../assets/images/Nagad-Logo.wine.svg';
import rocketImg from '../../assets/images/dutch-bangla-rocket-logo-png_seeklogo-317692.png';

// Payment Icons as SVG Components
const VisaIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path fill="#1A1F71" d="M9.064 8.482l-1.09 6.966h1.527l1.09-6.966H9.064zm6.11 0l-1.09 6.966h1.527l1.09-6.966h-1.527zm-8.2 0L4.782 15.45h1.527l.69-4.414.017-.107.63-2.446H6.974zm12.052 0l-1.09 6.966h1.258l.77-4.92.042-.268.62-1.778h-1.58zm-5.137 0l-1.09 6.966h4.183l.26-1.656h-2.606l.4-2.57h2.547l.26-1.656h-2.547l.4-2.57h2.606l.26-1.656h-4.183z" />
    </svg>
);

const MastercardIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path fill="#EB001B" d="M12 6.654a6 6 0 100 10.692 6 6 0 000-10.692z" />
        <path fill="#F79E1B" d="M12 6.654a6 6 0 110 10.692 6 6 0 010-10.692z" />
        <path fill="#FF5F00" d="M12 6.654a6 6 0 100 10.692 6 6 0 010-10.692z" />
    </svg>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const fullText = `
        Mahira Collection একটি বিশ্বস্ত অনলাইন প্ল্যাটফর্ম, যেখানে আপনি পাবেন সরাসরি চায়না থেকে আমদানি করা প্রিমিয়াম কোয়ালিটির প্রোডাক্ট।  কোনোভাবেই লোকাল বা নিম্নমানের প্রোডাক্টের সাথে আপস করি না।

গত চার বছর ধরে Mahira Collection সততা, মান এবং গ্রাহক সন্তুষ্টির ভিত্তিতে সফলভাবে আমাদের যাত্রা চালিয়ে যাচ্ছে। আমাদের প্রতিটি পণ্য যত্নসহকারে বাছাই করা, যাতে আপনি পান ট্রেন্ডি, স্টাইলিশ ও টেকসই ফ্যাশনের অভিজ্ঞতা।

আমাদের কাছে রয়েছে দুই ধরনের অপশন — স্টক থাকা প্রোডাক্ট এবং প্রি-অর্ডার (pre-order) সুবিধা, যাতে আপনি আপনার পছন্দমতো কেনাকাটার সুযোগ পান।

Mahira Collection-এ আমরা বিশ্বাস করি, কোয়ালিটি কোনো বিলাসিতা নয় — বরং এটা হওয়া উচিত প্রতিটি গ্রাহকের প্রাপ্য। তাই, আমাদের সঙ্গে থাকুন — এবং নিশ্চিত করুন সেরা মানের চায়নিজ কালেকশনের নির্ভরযোগ্য গন্তব্য।

ধন্যবাদ।
    `;
    const [isReadMore, setIsReadMore] = useState(false);
    const visibleText = isReadMore ? fullText : fullText.split('\n').slice(0, 4).join('\n');

    const toggleReadMore = () => {
        setIsReadMore(!isReadMore);
    };

    // For mobile accordion
    const [openSection, setOpenSection] = useState(null);
    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    // Payment methods data
    const paymentMethods = [
        {
            name: 'bKash',
            icon: <img src={bkashImg} alt="bKash" className="h-6 w-auto" />,
            color: 'bg-gradient-to-r from-pink-500 to-pink-600'
        },
        {
            name: 'Nagad',
            icon: <img src={nagadImg} alt="Nagad" className="h-6 w-auto" />,
            color: 'bg-gradient-to-r from-purple-500 to-purple-600'
        },
        {
            name: 'Rocket',
            icon: <img src={rocketImg} alt="Rocket" className="h-6 w-auto" />,
            color: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
        },
        {
            name: 'Visa',
            icon: <VisaIcon />,
            color: 'bg-gradient-to-r from-blue-500 to-blue-600'
        },
        {
            name: 'Mastercard',
            icon: <MastercardIcon />,
            color: 'bg-gradient-to-r from-red-500 to-red-600'
        },
        {
            name: 'Cash on Delivery',
            icon: <CreditCard size={16} className="text-white" />,
            color: 'bg-gradient-to-r from-green-500 to-green-600'
        }
    ];

    return (
        <footer className="bg-gradient-to-b mt-4 from-gray-900 to-gray-800 text-gray-300 play-regular w-full border-t border-gray-700">
            {/* Main Footer Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                {/* Brand and Description - Desktop */}
                <div className='hidden md:flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-gray-700 pb-10'>
                    {/* Brand Logo */}
                    <div className="w-full md:w-auto flex justify-center items-start md:justify-start">
                        <Link to="/" className="flex justify-center group">
                            <img
                                src={navbrandIMG}
                                alt="Mahira Collection Logo"
                                className="h-28 object-contain transform group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    </div>
                    {/* Company Description */}
                    <div className="text-sm md:text-base text-center md:text-left">
                        <p className="whitespace-pre-line leading-relaxed">
                            {visibleText}
                            {!isReadMore && fullText.split('\n').length > 4 && (
                                <button
                                    onClick={toggleReadMore}
                                    className="text-pink-400 hover:text-pink-300 font-medium ml-2 focus:outline-none flex items-center transition-colors"
                                >
                                    Read More <ChevronDown size={16} className="ml-1" />
                                </button>
                            )}
                            {isReadMore && fullText.split('\n').length > 4 && (
                                <button
                                    onClick={toggleReadMore}
                                    className="text-pink-400 hover:text-pink-300 font-medium ml-2 focus:outline-none flex items-center transition-colors"
                                >
                                    Read Less <ChevronUp size={16} className="ml-1" />
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Brand and Description - Mobile */}
                <div className='md:hidden mb-8 border-b border-gray-700 pb-8'>
                    <div className="flex flex-col items-center">
                        <Link to="/" className="mb-6 group">
                            <img
                                src={navbrandIMG}
                                alt="Mahira Collection Logo"
                                className="h-24 object-contain transform group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                        <p className="text-sm text-center whitespace-pre-line leading-relaxed">
                            {fullText.split('\n').slice(0, 4).join('\n')}
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Mobile Accordion */}
                    <div className="md:hidden space-y-6 mb-8">
                        {/* Quick Links */}
                        <div className="border-b border-gray-700 pb-3">
                            <button
                                onClick={() => toggleSection('quickLinks')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-white"
                            >
                                Quick Links
                                {openSection === 'quickLinks' ? <ChevronUp className="text-pink-400" /> : <ChevronDown className="text-pink-400" />}
                            </button>
                            {openSection === 'quickLinks' && (
                                <ul className="mt-4 space-y-3 text-sm pl-2">
                                    {[
                                        { name: 'Home', path: '/' },
                                        { name: 'About Us', path: '/about' },
                                        { name: 'Products', path: '/products' },
                                        { name: 'Contact', path: '/contact' },
                                        { name: 'Privacy Policy', path: '/privacy-policy' },
                                    ].map((link, index) => (
                                        <li key={index}>
                                            <Link
                                                to={link.path}
                                                className="hover:text-pink-400 transition-colors duration-200 block py-1.5"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="border-b border-gray-700 pb-3">
                            <button
                                onClick={() => toggleSection('contact')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-white"
                            >
                                Contact Us
                                {openSection === 'contact' ? <ChevronUp className="text-pink-400" /> : <ChevronDown className="text-pink-400" />}
                            </button>
                            {openSection === 'contact' && (
                                <div className="mt-4 space-y-4 text-sm pl-2">
                                    <div className="flex items-start space-x-3">
                                        <MapPin size={18} className="mt-0.5 flex-shrink-0 text-pink-400" />
                                        <span>123 Street Name, Cox's Bazar, Bangladesh</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail size={18} className="text-pink-400" />
                                        <a href="mailto:info@mahira.com" className="hover:text-pink-400 transition-colors duration-200">
                                            info@mahira.com
                                        </a>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone size={18} className="text-pink-400" />
                                        <a href="tel:+8801736600480" className="hover:text-pink-400 transition-colors duration-200">
                                            +880 01783694568
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Opening Hours */}
                        <div className="border-b border-gray-700 pb-3">
                            <button
                                onClick={() => toggleSection('hours')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-white"
                            >
                                Opening Hours
                                {openSection === 'hours' ? <ChevronUp className="text-pink-400" /> : <ChevronDown className="text-pink-400" />}
                            </button>
                            {openSection === 'hours' && (
                                <div className="mt-4 space-y-3 text-sm pl-2">
                                    <div className="flex items-center space-x-3">
                                        <Clock size={18} className="text-pink-400" />
                                        <span>Mon - Fri: 9am - 8pm</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock size={18} className="text-pink-400" />
                                        <span>Saturday: 10am - 6pm</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock size={18} className="text-pink-400" />
                                        <span>Sunday: Closed</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Methods - Mobile */}
                        <div className="border-b border-gray-700 pb-3">
                            <button
                                onClick={() => toggleSection('payments')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-white"
                            >
                                Payment Methods
                                {openSection === 'payments' ? <ChevronUp className="text-pink-400" /> : <ChevronDown className="text-pink-400" />}
                            </button>
                            {openSection === 'payments' && (
                                <div className="mt-4 grid grid-cols-3 gap-3 pl-2">
                                    {paymentMethods.map((method, index) => (
                                        <div
                                            key={index}
                                            className={`${method.color} p-2 rounded-md flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300`}
                                            title={method.name}
                                        >
                                            <div className="flex items-center justify-center h-6">
                                                {method.icon}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* Social Media */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-6">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a
                                    href="https://www.facebook.com/Homaira22"
                                    className="bg-gray-700 p-3 rounded-full shadow-lg text-white hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="bg-gray-700 p-3 rounded-full shadow-lg text-white hover:bg-gradient-to-r from-pink-500 to-purple-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="bg-gray-700 p-3 rounded-full shadow-lg text-white hover:bg-sky-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                                    aria-label="Twitter"
                                >
                                    <Twitter size={20} />
                                </a>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-white mb-6">Payment Methods</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {paymentMethods.map((method, index) => (
                                        <div
                                            key={index}
                                            className={`${method.color} p-3 rounded-md flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300`}
                                            title={method.name}
                                        >
                                            <div className="flex items-center justify-center h-6">
                                                {method.icon}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
                            <ul className="space-y-1 text-sm">
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'About Us', path: '/about' },
                                    { name: 'Products', path: '/all-categories' },
                                    { name: 'Contact', path: '/contact' },
                                    { name: 'Privacy Policy', path: '/privecy' },
                                    { name: 'Terms & Conditions', path: '/terms-condition' },
                                    { name: 'Returns & Exchanges', path: '/retrun' },
                                    { name: 'Shipping Policy', path: '/shipping' },
                                ].map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.path}
                                            className="hover:text-pink-400 transition-colors duration-200 block py-1.5"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-start space-x-3">
                                    <MapPin size={18} className="mt-0.5 flex-shrink-0 text-pink-400" />
                                    <span>123 Street Name, Cox's Bazar, Bangladesh</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail size={18} className="text-pink-400" />
                                    <a href="mailto:info@mahira.com" className="hover:text-pink-400 transition-colors duration-200">
                                        info@mahira.com
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone size={18} className="text-pink-400" />
                                    <a href="tel:+8801736600480" className="hover:text-pink-400 transition-colors duration-200">
                                        +880 01783694568
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone size={18} className="text-pink-400" />
                                    <a href="tel:+8801736600480" className="hover:text-pink-400 transition-colors duration-200">
                                        +880 01783694568
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Opening Hours & Newsletter */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-6">Opening Hours</h3>
                            <div className="space-y-3 text-sm mb-8">
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} className="text-pink-400" />
                                    <span>Mon - Fri: 9am - 8pm</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} className="text-pink-400" />
                                    <span>Saturday: 10am - 6pm</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} className="text-pink-400" />
                                    <span>Sunday: Closed</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-6">Newsletter</h3>
                            <form className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-md hover:from-pink-600 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Newsletter Section - Mobile */}
                    <div className="mt-10 pt-6 border-t border-gray-700 md:hidden">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white mt-1 mb-6">
                                Subscribe to Our Newsletter
                            </h3>
                            <form className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-md hover:from-pink-600 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-4 md:mt-12 pt-4 border-t border-gray-700 text-center text-sm">
                        <p className="text-gray-400">&copy; {currentYear} Mahira Collection. All rights reserved.</p>
                        <p className="mt-2 text-gray-500">Developed with <span className="text-pink-400">❤️</span> by RAKIB</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;