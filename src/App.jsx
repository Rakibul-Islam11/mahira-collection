
import { Outlet } from 'react-router-dom'
import './App.css'
import TopNav from './all-components/top-navbar/TopNav'
import MainNavbar from './all-components/main-navbar/MainNavbar'
import ResMarque from './all-components/res-marque/ResMarque'

function App() {


  return (
    <>
      <div>
        <TopNav></TopNav>
        <ResMarque></ResMarque>
        <MainNavbar></MainNavbar>
        <Outlet></Outlet>
      </div>
    </>
  )
}

export default App
