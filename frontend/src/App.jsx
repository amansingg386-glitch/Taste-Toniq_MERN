import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Admin from './pages/Admin/Admin'
import MyOrders from './pages/MyOrders/MyOrders'
import Gateway from './pages/Gateway/Gateway'
import Varieties from './pages/Varieties/Varieties'
import { useLocation } from 'react-router-dom'

const App = () => {

  const [showLogin,setShowLogin]=useState(false)
  const location = useLocation();
  const isGateway = location.pathname === '/';

  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      {!isGateway && <Navbar setShowLogin={setShowLogin}/>}
      <Routes>
        <Route path='/' element={<Gateway/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/admin' element={<Admin/>}/>
        <Route path='/myorders' element={<MyOrders/>}/>
        <Route path='/varieties' element={<Varieties/>}/>
      </Routes>
    </div>
    {!isGateway && <Footer />}    
    
    </>
  )
}

export default App