import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Home = () => {
    const [category,setCategory]=useState("All");
  return (
    <div>
      <Header/>
      
      <div className="regional-cuisines-banner" style={{ margin: '40px 0 20px 0', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ff6b35, #ff4500)', padding: '30px 40px', borderRadius: '15px', color: 'white', boxShadow: '0 10px 25px rgba(255, 107, 53, 0.2)'}}>
          <div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>Authentic Regional Cuisines 🥘</h2>
              <p style={{ opacity: 0.9, fontSize: '15px' }}>Craving something special? Discover authentic regional dishes from across India.</p>
          </div>
          <Link to='/varieties'>
              <button style={{ padding: '14px 30px', borderRadius: '50px', border: 'none', background: 'white', color: '#ff4500', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}>Explore Regional Menu →</button>
          </Link>
      </div>


      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category} />
    </div>
  )
}

export default Home