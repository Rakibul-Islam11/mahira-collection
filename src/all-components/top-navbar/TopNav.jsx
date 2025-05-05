import Marquee from "react-fast-marquee";
import { FaFacebookSquare, FaInstagram } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";

const TopNav = () => {
    return (
        <div className="w-[100%] md:w-[75%] mx-auto py-0 md:py-4 flex flex-row justify-between items-center px-2 md:px-0">
            <div className="shrink-0 whitespace-nowrap text-[14px]">
                <a href="tel:+8801712345678">📞 +880 1712 345 678</a>
            </div>
            <div className="w-full hidden md:block px-4 font-semibold">
                <Marquee>
                    hnbkjbndsfh;kln
                </Marquee>
            </div>
            <div className="flex flex-row gap-1 md:gap-2 shrink-0">
                <a href=""><FaFacebookSquare /></a>
                <a href=""><IoLogoYoutube /></a>
                <a href=""><FaInstagram /></a>
            </div>
        </div>

    );
};

export default TopNav;