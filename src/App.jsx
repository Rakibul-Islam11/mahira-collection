
import { Outlet } from 'react-router-dom'
import './App.css'
import TopNav from './all-components/top-navbar/TopNav'
import MainNavbar from './all-components/main-navbar/MainNavbar'
import ResMarque from './all-components/res-marque/ResMarque'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient();
function App() {


  return (
    <>
      <div className='w-[100%] xl:w-[80%] mx-auto px-[1px] '>
        <QueryClientProvider client={queryClient}>
          <TopNav></TopNav>
          <ResMarque></ResMarque>
          <MainNavbar></MainNavbar>
          <Outlet></Outlet>
        </QueryClientProvider>
        
      </div>
    </>
  )
}

export default App
