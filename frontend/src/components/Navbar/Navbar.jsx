import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({setShowLogin}) => {

   const [menu,setMenu] = useState("home");

   const {getTotalCartAmount, searchQuery, setSearchQuery, token, setToken}= useContext(StoreContext);
   const navigate = useNavigate();
   const location = useLocation();
   const isAdmin = location.pathname.startsWith('/admin');

   const logout = () => {
       localStorage.removeItem("token");
       setToken("");
       navigate("/");
   }

  return (
    <div className='navbar'>
        <Link to='/home'><img src={assets.logo} alt="" className="logo" /></Link>
        {!isAdmin && (
            <ul className="navbar-menu">
               <Link to='/home' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>Home</Link>
               <a href='#explore-menu' onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>Menu</a>
               <a href='#footer' onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>Contact Us</a>
            </ul>
        )}
        <div className="navbar-right">
            {!isAdmin ? (
                <>
                    <div style={{display:'flex', alignItems: 'center', gap:'10px', border:'1px solid #ccc', padding:'2px 10px', borderRadius:'50px'}}>
                        <img src={assets.search_icon} alt="" style={{width:'20px'}}/>
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} style={{border:'none', outline:'none', background:'transparent', width:'150px'}} />
                    </div>
                    <div className="navbar-search-icon">
                        <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
                        <div className={getTotalCartAmount()===0?"":"dot"}></div>
                    </div>
                    
                    {!token ? <button onClick={()=>setShowLogin(true)}>Sign In</button>
                            : <div className='navbar-profile'>
                                <img src={assets.profile_icon} alt="" />
                                <ul className="nav-profile-dropdown">
                                    <li onClick={()=>navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                                    <hr />
                                    <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                                </ul>
                              </div>}
                </>
            ) : (
                <button onClick={() => { localStorage.removeItem("admin_token"); navigate('/'); }} style={{backgroundColor: '#ef4444', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Admin Logout</button>
            )}
        </div>
    </div>
  )
}

export default Navbar