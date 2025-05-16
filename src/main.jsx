import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './all-components/home-page/Home.jsx'
import { AuthProvider } from './all-components/auth-contextapi/AuthProvider.jsx'

import CategoryProducts from './all-components/category-products-page/CategoryProducts.jsx'
import AllCategoriesPage from './all-components/all-category-page/AllCategoriesPage.jsx'
import ProductDetails from './all-components/product-details-page/ProductDetails.jsx'

import NonDirectCategory from './all-components/non-direct-category/NonDirectCategory.jsx'

import Cart from './all-components/Cart-page/Cart.jsx'
import Footer from './all-components/footer-page/Footer.jsx'
import Checkout from './all-components/checkout-page/Checkout.jsx'
import CompleteOrder from './all-components/OrderComplete-page/CompleteOrder.jsx'
import ProductUpdate from './all-components/admin-panel-page/ProductUpdate.jsx'
import AdminLayout from './all-components/admin-panel-page/AdminLayout.jsx'
import HeadlineUpdate from './all-components/admin-panel-page/HeadlineUpdate.jsx'
import OrderCart from './all-components/admin-panel-page/OrderCart.jsx'
import TrandingProduct from './all-components/tranding-product-page/TrandingProduct.jsx'
import CategorySlider from './all-components/category-slider/CategorySlider.jsx'
import HeroSliderImageUpload from './all-components/admin-panel-page/HeroSliderImageUpload.jsx'
import Up from './all-components/admin-panel-page/Up.jsx'
import MenuCategoryForm from './all-components/admin-panel-page/MenuCategoryForm.jsx'
import PrivateRoute from './all-components/admin-panel-page/PrivateRoute.jsx'
import AdminLogin from './all-components/admin-panel-page/AdminLogin.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App></App>,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/home',
        element: <Home />
      },
      {
        path: '/category/:gender',
        element: <NonDirectCategory />
      },

      {
        path: '/category/:gender/:category',
        element: <CategoryProducts />
      },
      {
        path: '/category/:gender',
        element: <CategoryProducts />
      },
      {
        path: '/all-categories',
        element: <AllCategoriesPage></AllCategoriesPage>
      },
      {
        path: '/product/:productId',
        element: <ProductDetails></ProductDetails>
      },
      {
        path: 'category-slider',
        element: <CategorySlider></CategorySlider>
      },

 
      {
        path: '/cart',
        element: <Cart></Cart>
      },
      {
        path: '/checkout',
        element: <Checkout></Checkout>
      },

      {
        path: '/complete-order',
        element: <CompleteOrder></CompleteOrder>
      },
      {
        path: 'trending-products',
        element: <TrandingProduct></TrandingProduct>
      },
      {
        path: '/footer',
        element : <Footer></Footer>
      },
      // {
      //   path: '/admin/product-update',
      //   element: <ProductUpdate></ProductUpdate>
      // },
      // {
      //   path: '/admin-panel',
      //   element: <AdminNavbar></AdminNavbar>
      // },
      {
        path: '/admin',
        element: <AdminLogin />,
      },
      {
        path: '/admin-panel',
        element: (
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true, element: <OrderCart /> },
          { path: 'order-cart', element: <OrderCart /> },
          { path: 'product-update', element: <ProductUpdate /> },
          { path: 'upload-products', element: <Up /> },
          { path: 'product-category', element: <MenuCategoryForm /> },
          { path: 'headline-update', element: <HeadlineUpdate /> },
          { path: 'banner-update', element: <HeroSliderImageUpload /> },
        ],
      }
    ]
    
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  </StrictMode>,
)


// যদি সেইম রাউট স্মসসা হয় প্রস্তাবিত সমাধান:

// আমি সমাধান 1(রাউট অর্ডার পরিবর্তন) ব্যবহার করার পরামর্শ দিচ্ছি, কারণ:

//     এটি সবচেয়ে সহজ সমাধান

//     কোনো অতিরিক্ত কম্পোনেন্ট বা লজিকের প্রয়োজন নেই

//     রাউটিং লজিক ক্লিয়ার থাকে

// মনে রাখবেন, React Router রাউটগুলোকে উপর থেকে নিচে ম্যাচ করে, তাই স্পেসিফিক রাউটগুলোকে(যেগুলোতে বেশি প্যারামিটার আছে) নিচে রাখুন এবং জেনেরিক রাউটগুলোকে উপরে রাখুন।