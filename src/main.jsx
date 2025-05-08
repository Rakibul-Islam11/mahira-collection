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
      // ডাইনামিক ক্যাটাগরি রাউট
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
        path: '/admin',
        element: <Admin></Admin>
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
