import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import './Admin.css'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'

const Admin = () => {
    const { url } = useContext(StoreContext)
    const [tab, setTab] = useState('add') // 'add', 'list', 'orders'
    const [orders, setOrders] = useState([])
    const [foods, setFoods] = useState([])
    const [editingFood, setEditingFood] = useState(null)
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Salad",
        image: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            // Since backend simply expects a JSON body
            const response = await axios.post(`${url}/api/food/add`, {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                category: data.category,
                image: data.image
            });
            if (response.data.success) {
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: "Salad",
                    image: ""
                });
                alert("Food Item Added Successfully!");
            } else {
                alert("Error Adding Food Item");
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to server");
        }
    }

    const fetchAllOrders = async () => {
        try {
            const response = await axios.get(url + "/api/order/list")
            if (response.data.success) {
                setOrders(response.data.data.reverse())
            } else {
                console.error("Error fetching admin orders");
            }
        } catch (error) {
            console.error("Error fetching admin orders:", error)
        }
    }

    const statusHandler = async (event, orderId) => {
        try {
            const response = await axios.post(url + "/api/order/status", {
                orderId,
                status: event.target.value
            })
            if (response.data.success) {
                await fetchAllOrders()
            }
        } catch (error) {
            console.error("Error updating status:", error)
        }
    }

    const fetchAllFoods = async () => {
        try {
            const response = await axios.get(url + "/api/food/list")
            if (response.data.success) {
                setFoods(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching foods:", error)
        }
    }

    const removeFood = async (foodId) => {
        try {
            const response = await axios.post(url + "/api/food/remove", { id: foodId })
            if (response.data.success) {
                alert("Food removed");
                await fetchAllFoods();
            } else {
                alert("Error removing food");
            }
        } catch (error) {
            console.error("Error removing food:", error)
        }
    }

    const startEditing = (food) => {
        setEditingFood(food);
        setData({
            name: food.name,
            description: food.description,
            price: food.price.toString(),
            category: food.category,
            image: food.image
        });
        setTab('add'); // reusing the add form for edit
    }

    const onUpdateHandler = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${url}/api/food/update`, {
                id: editingFood._id,
                name: data.name,
                description: data.description,
                price: Number(data.price),
                category: data.category,
                image: data.image
            });
            if (response.data.success) {
                setData({ name: "", description: "", price: "", category: "Salad", image: "" });
                setEditingFood(null);
                alert("Food Item Updated Successfully!");
                setTab('list');
            } else {
                alert("Error Updating Food Item");
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to server");
        }
    }

    useEffect(() => {
        if (tab === 'orders') {
            fetchAllOrders()
        } else if (tab === 'list') {
            fetchAllFoods()
        }
    }, [tab, url])

    return (
        <div className='admin'>
            <h2>Admin Dashboard</h2>
            <div className="admin-tabs">
                <button onClick={() => { setTab('add'); setEditingFood(null); setData({ name: "", description: "", price: "", category: "Salad", image: "" }); }} className={tab === 'add' ? 'active' : ''}>Add Food</button>
                <button onClick={() => setTab('list')} className={tab === 'list' ? 'active' : ''}>List Foods</button>
                <button onClick={() => setTab('orders')} className={tab === 'orders' ? 'active' : ''}>Orders</button>
            </div>

            {tab === 'add' ? (
                <div className="admin-add">
                    <h3>{editingFood ? "Edit Food Item" : "Add New Food Item"}</h3>
                    <form className='flex-col' onSubmit={editingFood ? onUpdateHandler : onSubmitHandler}>
                        <div className="add-product-name flex-col">
                            <p>Product name</p>
                            <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
                        </div>
                        <div className="add-product-description flex-col">
                            <p>Product description</p>
                            <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
                        </div>
                        <div className="add-category-price">
                            <div className="add-category flex-col">
                                <p>Product category</p>
                                <select onChange={onChangeHandler} name="category" value={data.category}>
                                    <option value="Salad">Salad</option>
                                    <option value="Rolls">Rolls</option>
                                    <option value="Deserts">Deserts</option>
                                    <option value="Sandwich">Sandwich</option>
                                    <option value="Cake">Cake</option>
                                    <option value="Pure Veg">Pure Veg</option>
                                    <option value="Pasta">Pasta</option>
                                    <option value="Noodles">Noodles</option>
                                    <option value="Gujrati">Gujrati</option>
                                    <option value="Bihari">Bihari</option>
                                    <option value="Punjabi">Punjabi</option>
                                    <option value="South-Indian">South-Indian</option>
                                </select>
                            </div>
                            <div className="add-price flex-col">
                                <p>Product price</p>
                                <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='₹ 20' required />
                            </div>
                        </div>
                        <div className="add-image flex-col">
                            <p>Product Image (Filename)</p>
                            <input onChange={onChangeHandler} value={data.image} type="text" name='image' placeholder='e.g., food_1.png' required />
                        </div>
                        <button type='submit' className='add-btn'>{editingFood ? "UPDATE" : "ADD"}</button>
                    </form>
                </div>
            ) : tab === 'list' ? (
                <div className="admin-list flex-col">
                    <p>All Foods List</p>
                    <div className="list-table">
                        <div className="list-table-format title">
                            <b>Image</b>
                            <b>Name</b>
                            <b>Category</b>
                            <b>Price</b>
                            <b>Action</b>
                        </div>
                        {foods.map((item, index) => {
                            // Dynamically append backend URL to image strings
                            const image_url = item.image.startsWith("http") ? item.image : `${url}/images/${item.image}`;
                            return (
                                <div key={index} className="list-table-format">
                                    <img src={image_url} alt="" className="admin-list-image" />
                                    <p className="list-food-name">{item.name}</p>
                                    <p className="list-food-category">{item.category}</p>
                                    <p className="list-food-price">₹{item.price}</p>
                                    <div className="admin-actions">
                                        <button onClick={() => startEditing(item)} className="edit-btn">Edit</button>
                                        <button onClick={() => removeFood(item._id)} className="delete-btn">X</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="admin-orders">
                    {orders.map((order, index) => (
                        <div key={index} className="admin-order-item">
                            <img src={assets.parcel_icon} alt="" />
                            <div>
                                <p className='order-item-food'>
                                    {order.items.map((item, i) => {
                                        return i === order.items.length - 1 ? item.name + " x " + item.quantity : item.name + " x " + item.quantity + ", "
                                    })}
                                </p>
                                <p className='order-item-name'>{order.address.firstName + " " + order.address.lastName}</p>
                                <div className="order-item-address">
                                    <p>{order.address.street + ","}</p>
                                    <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                                </div>
                                <p className='order-item-phone'>{order.address.phone}</p>
                            </div>
                            <p>Items: {order.items.length}</p>
                            <p>₹ {order.amount}</p>
                            <select onChange={(e) => statusHandler(e, order._id)} value={order.status}>
                                <option value="Food Processing">Food Processing</option>
                                <option value="Out for delivery">Out for delivery</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Admin
