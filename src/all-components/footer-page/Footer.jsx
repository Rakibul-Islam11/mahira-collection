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

// Payment Icons as SVG Components
const BkashIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path fill="#E2136E" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.215 7.625h-1.557c-.117 0-.21.093-.21.21v8.33c0 .117.093.21.21.21h1.557c.117 0 .21-.093.21-.21v-8.33c0-.117-.093-.21-.21-.21zm-4.183 0h-1.556c-.117 0-.21.093-.21.21v8.33c0 .117.093.21.21.21h1.556c.117 0 .21-.093.21-.21v-8.33c0-.117-.093-.21-.21-.21zm-4.183 0H8.293c-.117 0-.21.093-.21.21v8.33c0 .117.093.21.21.21h1.556c.117 0 .21-.093.21-.21v-8.33c0-.117-.093-.21-.21-.21zm-4.182 0H4.11c-.117 0-.21.093-.21.21v8.33c0 .117.093.21.21.21h1.557c.117 0 .21-.093.21-.21v-8.33c0-.117-.093-.21-.21-.21z" />
    </svg>
);

const NagadIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path fill="#E72D89" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.5 14.5h-13v-5h13v5z" />
    </svg>
);

const RocketIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path fill="#5D2D86" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm4-10a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

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
        Mahira Collection একটি অনলাইন ফ্যাশন শপ যেখানে মেয়েদের ও ছেলেদের জন্য আধুনিক এবং ট্রেন্ডি পোশাক ও অ্যাক্সেসরিজ পাওয়া যায়।
        আমাদের সংগ্রহে রয়েছে পার্টি, ক্যাজুয়াল ও ট্র্যাডিশনাল সব ধরনের পোশাক।
        মেয়েদের জন্য রয়েছে দোপাট্টা, কুর্তি, শাড়ি, হিজাব, ব্যাগ ও গহনার দারুণ কালেকশন।
        ছেলেদের জন্য রয়েছে পাঞ্জাবি, শার্ট, টি-শার্ট, ঘড়ি, চশমা ও জুতা।
        Mahira Collection সব বয়সের জন্য মানসম্মত পণ্যের নিশ্চয়তা দেয়।
        আমরা নতুন ট্রেন্ড ও সিজন অনুযায়ী কালেকশন আপডেট করি।
        দেশজুড়ে দ্রুত এবং নির্ভরযোগ্য ডেলিভারি সার্ভিস রয়েছে।
        আমাদের ওয়েবসাইট ব্যবহার করা সহজ এবং মোবাইল ফ্রেন্ডলি।
        বিশেষ ছাড় ও অফারের মাধ্যমে আমরা কাস্টমারদের জন্য শপিং আরও উপভোগ্য করে তুলি।
        Mahira Collection মানে স্টাইল, আরাম ও গুণগত মানের নিশ্চয়তা।
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
        { name: 'bKash', icon: <BkashIcon />, color: 'bg-pink-100 text-pink-600' },
        { name: 'Nagad', icon: <NagadIcon />, color: 'bg-purple-100 text-purple-600' },
        { name: 'Rocket', icon: <RocketIcon />, color: 'bg-indigo-100 text-indigo-600' },
        { name: 'Visa', icon: <VisaIcon />, color: 'bg-blue-100 text-blue-600' },
        { name: 'Mastercard', icon: <MastercardIcon />, color: 'bg-red-100 text-red-600' },
        { name: 'Cash on Delivery', icon: <CreditCard size={16} />, color: 'bg-green-100 text-green-600' }
    ];

    return (
        <footer className="bg-gray-50 text-gray-700 play-regular w-full border-t border-gray-200">
            {/* Main Footer Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Brand and Description - Desktop */}
                <div className='hidden md:flex flex-col md:flex-row items-center justify-between gap-8 mb-10 border-b border-gray-200 pb-8'>
                    {/* Brand Logo */}
                    <div className="w-full md:w-auto flex justify-center items-start md:justify-start">
                        <Link to="/" className="flex justify-center">
                            <img
                                src={navbrandIMG}
                                alt="Mahira Collection Logo"
                                className="h-24 object-contain"
                            />
                        </Link>
                    </div>
                    {/* Company Description */}
                    <div className="text-sm md:text-base text-center md:text-left">
                        <p className="whitespace-pre-line">
                            {visibleText}
                            {!isReadMore && fullText.split('\n').length > 4 && (
                                <button
                                    onClick={toggleReadMore}
                                    className="text-blue-600 hover:text-blue-800 font-medium ml-2 focus:outline-none flex items-center"
                                >
                                    Read More <ChevronDown size={16} className="ml-1" />
                                </button>
                            )}
                            {isReadMore && fullText.split('\n').length > 4 && (
                                <button
                                    onClick={toggleReadMore}
                                    className="text-blue-600 hover:text-blue-800 font-medium ml-2 focus:outline-none flex items-center"
                                >
                                    Read Less <ChevronUp size={16} className="ml-1" />
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Brand and Description - Mobile */}
                <div className='md:hidden mb-6 border-b border-gray-200 pb-6'>
                    <div className="flex flex-col items-center">
                        <Link to="/" className="mb-4">
                            <img
                                src={navbrandIMG}
                                alt="Mahira Collection Logo"
                                className="h-20 object-contain"
                            />
                        </Link>
                        <p className="text-sm text-center whitespace-pre-line">
                            {fullText.split('\n').slice(0, 4).join('\n')}
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Mobile Accordion */}
                    <div className="md:hidden space-y-4 mb-6">
                        {/* Quick Links */}
                        <div className="border-b border-gray-200 pb-2">
                            <button
                                onClick={() => toggleSection('quickLinks')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-gray-900"
                            >
                                Quick Links
                                {openSection === 'quickLinks' ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {openSection === 'quickLinks' && (
                                <ul className="mt-3 space-y-2 text-sm pl-2">
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
                                                className="hover:text-blue-600 transition-colors block py-1"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="border-b border-gray-200 pb-2">
                            <button
                                onClick={() => toggleSection('contact')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-gray-900"
                            >
                                Contact Us
                                {openSection === 'contact' ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {openSection === 'contact' && (
                                <div className="mt-3 space-y-3 text-sm pl-2">
                                    <div className="flex items-start space-x-3">
                                        <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                                        <span>123 Street Name, City, Country</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail size={18} />
                                        <a href="mailto:info@example.com" className="hover:text-blue-600">
                                            info@example.com
                                        </a>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone size={18} />
                                        <a href="tel:+1234567890" className="hover:text-blue-600">
                                            +1 234 567 890
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Opening Hours */}
                        <div className="border-b border-gray-200 pb-2">
                            <button
                                onClick={() => toggleSection('hours')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-gray-900"
                            >
                                Opening Hours
                                {openSection === 'hours' ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {openSection === 'hours' && (
                                <div className="mt-3 space-y-2 text-sm pl-2">
                                    <div className="flex items-center space-x-3">
                                        <Clock size={18} />
                                        <span>Mon - Fri: 9am - 8pm</span>
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
                            )}
                        </div>

                        {/* Payment Methods - Mobile */}
                        <div className="border-b border-gray-200 pb-2">
                            <button
                                onClick={() => toggleSection('payments')}
                                className="flex justify-between items-center w-full text-lg font-semibold text-gray-900"
                            >
                                Payment Methods
                                {openSection === 'payments' ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {openSection === 'payments' && (
                                <div className="mt-3 grid grid-cols-3 gap-2 pl-2">
                                    {paymentMethods.map((method, index) => (
                                        <div
                                            key={index}
                                            className={`${method.color} p-2 rounded-md flex items-center justify-center`}
                                        >
                                            <div className="flex items-center space-x-1">
                                                {method.icon}
                                                <span className="text-xs hidden sm:inline">{method.name}</span>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a
                                    href="#"
                                    className="bg-white p-2 rounded-full shadow-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="bg-white p-2 rounded-full shadow-sm text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="bg-white p-2 rounded-full shadow-sm text-gray-600 hover:text-sky-500 hover:bg-sky-50 transition-colors"
                                    aria-label="Twitter"
                                >
                                    <Twitter size={20} />
                                </a>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {paymentMethods.map((method, index) => (
                                        <div
                                            key={index}
                                            className={`${method.color} p-2 rounded-md flex items-center justify-center`}
                                            title={method.name}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {method.icon}
                                                <span className="text-xs hidden lg:inline">{method.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'About Us', path: '/about' },
                                    { name: 'Products', path: '/products' },
                                    { name: 'Contact', path: '/contact' },
                                    { name: 'Privacy Policy', path: '/privacy-policy' },
                                    { name: 'Terms & Conditions', path: '/terms' },
                                    { name: 'Returns & Exchanges', path: '/returns' },
                                    { name: 'Shipping Policy', path: '/shipping' },
                                ].map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.path}
                                            className="hover:text-blue-600 transition-colors block py-1"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start space-x-3">
                                    <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                                    <span>123 Street Name, Cox's Bazar, Bangladesh</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail size={18} />
                                    <a href="mailto:info@mahira.com" className="hover:text-blue-600">
                                        info@mahira.com
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone size={18} />
                                    <a href="tel:+8801736600480" className="hover:text-blue-600">
                                        +880 1736 600480
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone size={18} />
                                    <a href="tel:+8801736600480" className="hover:text-blue-600">
                                        +880 1736 600480
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-3">
                                    <Clock size={18} />
                                    <span>Mon - Fri: 9am - 8pm</span>
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

                            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Newsletter</h3>
                            <form className="space-y-3">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Newsletter Section - Mobile */}
                    <div className="mt-8 pt-4 border-t border-gray-200 md:hidden">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-4">
                                Subscribe to Our Newsletter
                            </h3>
                            <form className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                        <p>&copy; {currentYear} Mahira Collection. All rights reserved.</p>
                        <p className="mt-1">Developed with ❤️ by Your Company</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;