import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
               <img src={assets.logo} alt="" className="footer-logo" />
               <p>Taste & Toniq is dedicated to delivering exceptional culinary experiences with a perfect balance of taste, quality, and innovation. Indulge in flavors that speak for themselves.</p>
               <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.twitter_icon} alt="" />
                <img src={assets.linkedin_icon} alt="" />
               </div>
            </div>
            <div className="footer-content-center">
                <h2>Taste & Toniq</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
               <h2>GET IN TOUCH</h2>
               <ul>
                <li>+91-9547896541</li>
                <li>amansingg386@gmail.com</li>
               </ul>
            </div>
        </div>
        <hr />
        <p className="footer-copyright">Copyright 2026 © Taste&Toniq.com - All Rights Reserved.</p>     
    </div>
  )
}

export default Footer