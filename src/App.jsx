
import { Outlet } from 'react-router-dom'
import './App.css'
import TopNav from './all-components/top-navbar/TopNav'
import MainNavbar from './all-components/main-navbar/MainNavbar'

function App() {


  return (
    <>
      <div>
        <TopNav></TopNav>
        <MainNavbar></MainNavbar>
        <Outlet></Outlet>
      </div>
    </>
  )
}

export default App
