import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { FaFacebookSquare, FaInstagram } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firbase.config";


const TopNav = () => {
    const [newsHeadlines, setNewsHeadlines] = useState([]);

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

        fetchHeadlines();
    }, []);

    return (
        <div className="w-[100%] md:w-[75%] mx-auto py-0 md:py-4 flex flex-row justify-between items-center px-2 md:px-0">
            <div className="shrink-0 whitespace-nowrap text-[14px]">
                <a href="tel:+8801712345678">📞 +880 1712 345 678</a>
            </div>
            <div className="w-full hidden md:block px-4 font-semibold">
                <Marquee>
                    {newsHeadlines.map((headline, index) => (
                        <span key={index} className="mx-4">
                            {headline}
                        </span>
                    ))}
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
