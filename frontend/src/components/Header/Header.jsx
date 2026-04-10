import React from 'react'
import './Header.css'
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className='header'>
      <div className="header-contents">
        <h2>Order Your favourite food here</h2>
        <p>A food order menu allows customers to select their favorite dishes from a variety of available options. It helps them easily choose and place their order according to their taste and preference.</p>
        <button onClick={() => document.getElementById('explore-menu').scrollIntoView({ behavior: 'smooth' })}>View Menu</button>
      </div>
    </div>
  )
}

export default Header