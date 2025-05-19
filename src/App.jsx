import { Outlet} from 'react-router-dom'

import './App.css'
import TopNav from './all-components/top-navbar/TopNav'
import MainNavbar from './all-components/main-navbar/MainNavbar'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Footer from './all-components/footer-page/Footer'
import ScrollToTop from './all-components/ScrollToTop'
import { AuthProvider } from './all-components/contexts-page/AuthContext'
import { useEffect } from 'react'
import { initFacebookPixel } from './facebookPixel'

const queryClient = new QueryClient();

function App() {

  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <AuthProvider>
        <div className='for_bg'>
          <div className='w-[100%] xl:w-[89%] mx-auto bg-pink-100 shadow-xl mb-16 md:mb-0'>
            <TopNav />
            <MainNavbar />
            <Outlet />
            <Footer />
          </div>
        </div>
      </AuthProvider>
     
     
    </QueryClientProvider>
  )
}

export default App;