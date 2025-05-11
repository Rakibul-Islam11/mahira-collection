import AllProductsPage from "../all-category-page/AllCategoriesPage";
import Hero from "../hero-section/Hero";

const Home = () => {
    return (
        <div >
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