import AllProductsPage from "../all-category-page/AllCategoriesPage";
import Hero from "../hero-section/Hero";

const Home = () => {
    return (
        <div className="w-[98%] md:w-[80%] mx-auto mt-2 md:mt-6 pb-10">
            <div>
                <Hero></Hero>
            </div>
            <div>
                <div>
                    <AllProductsPage></AllProductsPage>
                </div>
            </div>
        </div>
    );
};

export default Home;