import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './all-components/home-page/Home.jsx'

import { AuthProvider } from './all-components/auth-contextapi/AuthProvider.jsx'
import Admin from './all-components/admin-page/Admin.jsx'
import CategoryProducts from './all-components/category-products-page/CategoryProducts.jsx'
import AllCategoriesPage from './all-components/all-category-page/AllCategoriesPage.jsx'
import ProductDetails from './all-components/product-details-page/ProductDetails.jsx'
import Up from './all-components/up/Up.jsx'
import NonDirectCategory from './all-components/non-direct-category/NonDirectCategory.jsx'
import MenuCategoryForm from './all-components/up/MenuCategoryForm.jsx'
import Cart from './all-components/Cart-page/Cart.jsx'
import Footer from './all-components/footer-page/Footer.jsx'
import Checkout from './all-components/checkout-page/Checkout.jsx'
import CompleteOrder from './all-components/OrderComplete-page/CompleteOrder.jsx'


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
        path: '/admin',
        element: <Admin></Admin>
      },
      {
        path: '/up-products',
        element: <Up></Up>
      },
      {
        path: '/up-categories',
        element: <MenuCategoryForm></MenuCategoryForm>
      },
      {
        path: '/cart',
        element: <Cart></Cart>
      },
      {
        path: '/checkout',
        element: <Checkout></Checkout>
      },
      // {
      //   path: '/order-complete',
      //   element: <OrderComplete></OrderComplete>
      // },
      {
        path: '/complete-order',
        element: <CompleteOrder></CompleteOrder>
      },
      {
        path: '/footer',
        element : <Footer></Footer>
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