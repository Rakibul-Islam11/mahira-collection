import { Link } from 'react-router-dom';
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    Clock
} from 'lucide-react';
import navbrandIMG from '../../assets/images/480353899_615347981104853_3842057109669510985_n (1).jpg';
import { useState } from 'react';

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

    return (
        <footer className="bg-gray-100 mt-20 text-gray-700 play-regular w-full border-t border-gray-200">
            {/* Main Footer Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className='flex flex-col md:flex-row items-center justify-between gap-8 mb-10 border-b border-gray-200 pb-8'>
                    {/* Brand Logo */}
                    <div className="w-full md:w-auto flex justify-center md:justify-start">
                        <Link to="/" className="flex justify-center">
                            <img
                                src={navbrandIMG}
                                alt="Brand Logo"
                                className="h-20 md:h-32 object-cover"
                            />
                        </Link>
                    </div>
                    {/* Company Description */}
                    <div className="text-sm md:text-base">
                        <p>
                            {visibleText}
                            {!isReadMore && fullText.split('\n').length > 4 && (
                                <button onClick={toggleReadMore} className="text-blue-500 hover:underline focus:outline-none">
                                    Read More
                                </button>
                            )}
                            {isReadMore && fullText.split('\n').length > 4 && (
                                <button onClick={toggleReadMore} className="text-blue-500 hover:underline focus:outline-none">
                                    Read Less
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* About Us */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Us</h3>
                            <p className="text-sm leading-relaxed mb-4">
                                We are dedicated to providing the best products and services to our
                                customers with quality and care.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                                    <Facebook size={20} />
                                </a>
                                <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="text-gray-500 hover:text-sky-500 transition-colors">
                                    <Twitter size={20} />
                                </a>
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
                                ].map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            to={link.path}
                                            className="hover:text-blue-600 transition-colors"
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
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="text-center max-w-md mx-auto">
                            <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-4">
                                Subscribe to Our Newsletter
                            </h3>
                            <form className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full sm:w-auto flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                        <p>&copy; {currentYear} Mahira Collection. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;