import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { FaFacebookSquare, FaInstagram, FaWhatsapp, FaTelegram } from "react-icons/fa";
import { IoLogoYoutube, IoMdCall } from "react-icons/io";
import { FiMail } from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firbase.config";

const TopNav = () => {
    const [newsHeadlines, setNewsHeadlines] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const fetchHeadlines = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "headline"));
                const headlines = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.news) {
                        headlines.push(data.news);
                    }
                });
                setNewsHeadlines(headlines);
            } catch (error) {
                console.error("Error fetching headlines:", error);
            }
        };

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        fetchHeadlines();
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <div className={`w-full transition-all duration-300 ${isScrolled ? 'py-2 bg-white shadow-md' : 'py-2 bg-gradient-to-r from-pink-50 to-blue-50 border-b border-gray-100'}`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-row justify-between items-center">
                {/* Contact Info - Premium Styled */}
                <div className="flex items-center space-x-4 md:space-x-6">
                    <a
                        href="tel:+8801783694568"
                        className="flex items-center text-sm md:text-[15px] font-medium text-gray-700 hover:text-pink-600 transition-all duration-300 group"
                    >
                        <div className="relative p-1.5 rounded-full bg-pink-100 group-hover:bg-pink-200 mr-2 transition-colors duration-300">
                            <IoMdCall className="text-pink-600" size={16} />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
                        </div>
                        <span className="font-sans">+8801783694568</span>
                    </a>
                    <a
                        href="mailto:info@mahira.com"
                        className="hidden md:flex items-center text-sm md:text-[15px] font-medium text-gray-700 hover:text-pink-600 transition-all duration-300 group"
                    >
                        <div className="p-1.5 rounded-full bg-blue-100 group-hover:bg-blue-200 mr-2 transition-colors duration-300">
                            <FiMail className="text-blue-600" size={16} />
                        </div>
                    </a>
                    <a
                        href="https://wa.me/8801712345678"
                        className="hidden md:flex items-center text-sm md:text-[15px] font-medium text-gray-700 hover:text-pink-600 transition-all duration-300 group"
                    >
                        <div className="p-1.5 rounded-full bg-green-100 group-hover:bg-green-200 mr-2 transition-colors duration-300">
                            <FaWhatsapp className="text-green-600" size={16} />
                        </div>
                    </a>
                </div>

                {/* Premium News Marquee */}
                {newsHeadlines.length > 0 && (
                    <div className="hidden md:block flex-1 mx-6 overflow-hidden">
                        <Marquee
                            speed={40}
                            gradient={false}
                            pauseOnHover
                            className="py-1"
                        >
                            {newsHeadlines.map((headline, index) => (
                                <span
                                    key={index}
                                    className="mx-6 text-lg font-semibold text-black flex items-center"
                                >
                                    <span className="relative flex h-3 w-3 mr-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
                                    </span>
                                    <span className="font-sans">{headline}</span>
                                </span>
                            ))}
                        </Marquee>
                    </div>
                )}

                {/* Premium Social Media */}
                <div className="flex items-center space-x-3 md:space-x-4">
                    <a
                        href="https://www.facebook.com/Homaira22"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-[#1877F2] transition-all duration-300 transform hover:scale-110"
                        aria-label="Facebook"
                    >
                        <FaFacebookSquare size={18} />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-[#FF0000] transition-all duration-300 transform hover:scale-110"
                        aria-label="YouTube"
                    >
                        <IoLogoYoutube size={20} />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-[#E4405F] transition-all duration-300 transform hover:scale-110"
                        aria-label="Instagram"
                    >
                        <FaInstagram size={18} />
                    </a>
                </div>
            </div>

            {/* Premium Mobile News Ticker */}
            {newsHeadlines.length > 0 && (
                <div className="md:hidden bg-gradient-to-r from-pink-100 to-blue-100 py-2 px-2 border-t border-gray-200">
                    <Marquee speed={35} pauseOnHover gradient={false}>
                        {newsHeadlines.map((headline, index) => (
                            <span key={index} className="mx-4 text-sm font-semibold text-black flex items-center">
                                <span className="relative flex h-2 w-2 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                                </span>
                                <span className="font-sans">{headline}</span>
                            </span>
                        ))}
                    </Marquee>
                </div>
            )}
        </div>
    );
};

export default TopNav;