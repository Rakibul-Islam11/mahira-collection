
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firbase.config";



const ResMarque = () => {
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
       


            <div>
                <div>
                    <div className="w-full block md:hidden px-4">
                        <Marquee>
                            {newsHeadlines.map((headline, index) => (
                                <span key={index} className="mx-4">
                                    {headline}
                                </span>
                            ))}
                        </Marquee>
                    </div>
                </div>
            </div>



        
    );
};

export default ResMarque;