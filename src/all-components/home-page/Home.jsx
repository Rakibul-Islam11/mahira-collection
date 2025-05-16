import AllProductsPage from "../all-category-page/AllCategoriesPage";
import CategorySlider from "../category-slider/CategorySlider.jsx";
import Hero from "../hero-section/Hero";
import TrandingProduct from '../tranding-product-page/TrandingProduct.jsx'

const Home = () => {
    return (
        <div className="bg-pink-100 ">
            <div>
                <Hero></Hero>
            </div>
            <div>
                <CategorySlider></CategorySlider>
            </div>
            <div>
                <TrandingProduct></TrandingProduct>
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