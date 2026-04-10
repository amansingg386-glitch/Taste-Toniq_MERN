import React, { useState, useContext } from 'react';
import './Gateway.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Gateway = () => {
    const { url, setToken } = useContext(StoreContext);
    const navigate = useNavigate();

    // 'selection', 'user-login', 'user-signup', 'admin-login'
    const [view, setView] = useState('selection');
    const [data, setData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
        setError("");
    }

    const onUserSubmit = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if (view === "user-login") {
            newUrl += "/api/user/login";
        } else {
            newUrl += "/api/user/register";
        }
        try {
            const response = await axios.post(newUrl, data);
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                navigate('/home');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.log(err);
            setError("Server connection error.");
        }
    }

    const onAdminSubmit = (event) => {
        event.preventDefault();
        // Fallback admin authentication logic
        if (data.email === "admin@fooddel.com" && data.password === "admin123") {
            localStorage.setItem("admin_token", "admin_authenticated");
            navigate('/admin');
        } else {
            setError("Invalid Admin Credentials.");
        }
    }

    return (
        <div className="gateway-page">
            <ul className="floating-circles">
                <li></li><li></li><li></li><li></li><li></li>
                <li></li><li></li><li></li><li></li><li></li>
            </ul>
            <div className="gateway-container">
                <h1>Welcome to Taste & Toniq </h1>
                <p className="gateway-subtitle">Please identify yourself to continue</p>

                {view === 'selection' && (
                    <div className="gateway-portals">
                        <div className="portal-card user-card" onClick={() => setView('user-login')}>
                            <div className="portal-icon">
                                <img src="/user_portal.png" alt="User" />
                            </div>
                            <h3>User Portal</h3>
                            <p>Order delicious food straight to your door</p>
                        </div>
                        <div className="portal-card admin-card" onClick={() => setView('admin-login')}>
                            <div className="portal-icon">
                                <img src="/admin_portal.png" alt="Admin" />
                            </div>
                            <h3>Admin Portal</h3>
                            <p>Manage inventory & track ongoing orders</p>
                        </div>
                    </div>
                )}

                {(view === 'user-login' || view === 'user-signup') && (
                    <form className="gateway-form slide-up" onSubmit={onUserSubmit}>
                        <h2>{view === 'user-login' ? 'User Login' : 'Create User Account'}</h2>
                        {view === 'user-signup' && <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your Name' required />}
                        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email Address' required />
                        <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />

                        {error && <p className="gateway-error">{error}</p>}
                        <button type="submit">{view === 'user-login' ? 'LOGIN' : 'SIGN UP'}</button>

                        <div className="gateway-switch">
                            {view === 'user-login'
                                ? <p>New here? <span onClick={() => setView('user-signup')}>Create account</span></p>
                                : <p>Already have an account? <span onClick={() => setView('user-login')}>Login here</span></p>
                            }
                        </div>
                        <p className="back-link" onClick={() => { setView('selection'); setError(""); setData({ name: "", email: "", password: "" }) }}>← Back to Selection</p>
                    </form>
                )}

                {view === 'admin-login' && (
                    <form className="gateway-form slide-up admin-form" onSubmit={onAdminSubmit}>
                        <div className="admin-badge">Secure System</div>
                        <h2>Admin Authentication</h2>
                        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Admin Email' required />
                        <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Admin Password' required />

                        {error && <p className="gateway-error">{error}</p>}
                        <button type="submit" className="admin-btn">ACCESS DASHBOARD</button>

                        <p className="back-link" onClick={() => { setView('selection'); setError(""); setData({ name: "", email: "", password: "" }) }}>← Back to Selection</p>
                        <p className="admin-hint">Hint: admin@fooddel.com / admin123</p>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Gateway;
