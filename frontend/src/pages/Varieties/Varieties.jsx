import React, { useContext } from 'react';
import './Varieties.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';

const Varieties = () => {
    const { food_list } = useContext(StoreContext);
    const regions = ["Gujrati", "Bihari", "Punjabi", "South-Indian"];
    
    const regionalFoods = food_list.filter(food => regions.includes(food.category));

    return (
        <div className="varieties-page">
            <div className="varieties-hero">
                <h1>Authentic Regional Cuisines</h1>
                <p>Experience hand-crafted traditional flavors directly mapped from their origins.</p>
            </div>
            
            <div className="varieties-nav">
                {regions.map((region, idx) => (
                    <a key={idx} href={`#${region}`} className="region-pill">{region}</a>
                ))}
            </div>

            <div className="varieties-container">
                {regions.map((region, idx) => {
                    const regionalDishes = regionalFoods.filter(item => item.category === region);
                    if (regionalDishes.length === 0) return null;

                    return (
                        <div key={idx} id={region} className="region-section">
                            <h2 className="region-title">{region} Excellence</h2>
                            <div className="food-display-list">
                                {regionalDishes.map((item, index) => {
                                    return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image}/>
                                })}
                            </div>
                        </div>
                    )
                })}
                {regionalFoods.length === 0 && (
                    <div className="empty-regions">
                        <h2>More variety coming soon!</h2>
                        <p>The Admin is preparing freshly uploaded {regions.join(', ')} dishes. Try refreshing shortly!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Varieties;
