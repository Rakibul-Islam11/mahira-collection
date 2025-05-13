import AllProductsPage from "../all-category-page/AllCategoriesPage";
import Hero from "../hero-section/Hero";

const Home = () => {
    return (
        <div className="bg-gray-100 ">
            <div>
                <Hero></Hero>
            </div>
            <div className="px-1 md:px-4">
                <div>
                    <AllProductsPage></AllProductsPage>
                </div>
            </div>
        </div>
    );
};

export default Home;