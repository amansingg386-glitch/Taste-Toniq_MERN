import React, { useContext, useState, useEffect, useRef } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
    const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext)
    const navigate = useNavigate();

    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        countryCode: "+91",
        phone: ""
    });

    const [errors, setErrors] = useState({});
    const [paymentMode, setPaymentMode] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card"); // card, cod, upi
    const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Searchable Country Code State
    const [allCountries, setAllCountries] = useState([]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const countryRef = useRef(null);

    // Fetch all country dialing codes on mount
    useEffect(() => {
        axios.get("https://restcountries.com/v3.1/all?fields=name,idd,cca2")
            .then(res => {
                const list = res.data.map(c => ({
                    name: c.name.common,
                    code: (c.idd.root || "") + (c.idd.suffixes ? c.idd.suffixes[0] : ""),
                    iso: c.cca2
                })).filter(c => c.code);
                list.sort((a, b) => a.name.localeCompare(b.name));
                setAllCountries(list);
            })
            .catch(err => console.error("Could not load country dialing codes.", err));
    }, []);

    // Debounced API fetch for city autocomplete
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (data.city && data.city.length > 2 && showDropdown) {
                try {
                    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(data.city)}&addressdetails=1&limit=5`);
                    setCitySuggestions(res.data || []);
                } catch (e) {
                    console.error("Autocomplete error:", e);
                }
            } else {
                setCitySuggestions([]);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [data.city, showDropdown]);

    // Close dropdowns if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (countryRef.current && !countryRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCitySelect = (suggestion) => {
        const addr = suggestion.address || {};
        setData(prev => ({
            ...prev,
            city: addr.city || addr.town || addr.village || data.city,
            state: addr.state || data.state,
            country: addr.country || data.country,
            zipcode: addr.postcode || data.zipcode
        }));
        setShowDropdown(false);
        setErrors(prev => ({ ...prev, city: "", state: "", country: "", zipcode: "" }));
    }

    const onCityChangeHandler = (event) => {
        onChangeHandler(event);
        setShowDropdown(true);
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        let value = event.target.value;

        // Restrict phone strictly to digits and max 10
        if (name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

        setData(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: "" }))
    }

    const validateForm = () => {
        let newErrors = {};
        const textRegex = /^[A-Za-z\s]{2,}$/;

        if (!textRegex.test(data.firstName)) newErrors.firstName = "Enter a valid first name";
        if (!textRegex.test(data.lastName)) newErrors.lastName = "Enter a valid last name";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) newErrors.email = "Enter a valid email";

        if (data.street.trim().length < 3) newErrors.street = "Enter a valid street address";
        if (!textRegex.test(data.city)) newErrors.city = "Enter a valid city";
        if (!textRegex.test(data.state)) newErrors.state = "Enter a valid state";
        if (!textRegex.test(data.country)) newErrors.country = "Enter a valid country";

        if (data.zipcode.trim().length < 4) newErrors.zipcode = "Invalid zip code";

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(data.phone)) newErrors.phone = "Enter a valid 10-digit phone number";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const placeOrderHandler = async (event) => {
        event.preventDefault();
        if (validateForm()) {
            try {
                setIsVerifyingLocation(true);
                const apiRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}&country=${encodeURIComponent(data.country)}&postalcode=${encodeURIComponent(data.zipcode)}`);
                if (apiRes.data && apiRes.data.length > 0) {
                    setPaymentMode(true);
                } else {
                    setErrors(prev => ({ ...prev, api: "Location could not be verified. Please ensure your City and State mutually exist and match the Zipcode." }));
                }
            } catch (error) {
                console.error("Location API error", error);
                // Fallback: If OSM API fails, just allow it instead of blocking forever
                setPaymentMode(true);
            } finally {
                setIsVerifyingLocation(false);
            }
        }
    }

    const handlePayment = async (event) => {
        event.preventDefault();
        let orderItems = [];
        food_list.forEach((item) => {
            if (cartItems[item._id] > 0) {
                let itemInfo = item;
                itemInfo["quantity"] = cartItems[item._id];
                orderItems.push(itemInfo)
            }
        })

        let orderData = {
            items: orderItems,
            amount: getTotalCartAmount() + 2,
            address: { ...data, phone: `${data.countryCode} ${data.phone}` },
            paymentMethod: paymentMethod
        }

        try {
            const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
            if (response.data.success) {
                setCartItems({});
                alert(`Payment Successful using ${paymentMethod.toUpperCase()}! Order placed.`);
                navigate('/myorders');
            } else {
                alert("Error placing order: " + response.data.message);
                setPaymentMode(false);
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to the server");
            setPaymentMode(false);
        }
    }

    if (paymentMode) {
        return (
            <div className="payment-container">
                <h2>Select Payment Method</h2>

                <div className="payment-tabs">
                    <button className={paymentMethod === 'card' ? 'active' : ''} onClick={() => setPaymentMethod('card')}>Card</button>
                    <button className={paymentMethod === 'upi' ? 'active' : ''} onClick={() => setPaymentMethod('upi')}>UPI</button>
                    <button className={paymentMethod === 'cod' ? 'active' : ''} onClick={() => setPaymentMethod('cod')}>Cash</button>
                </div>

                <form onSubmit={handlePayment} className='payment-form'>
                    <p className='amount-display'>Amount to pay: <span>₹ {getTotalCartAmount() + 2}</span></p>

                    {paymentMethod === 'card' && (
                        <div className="method-details slide-in">
                            <label>Card Number</label>
                            <input type="text" placeholder='1234 5678 1234 5678' required minLength={16} maxLength={16} />
                            <div className='payment-details-inline'>
                                <div>
                                    <label>Expiry Date</label>
                                    <input type="text" placeholder='MM/YY' required />
                                </div>
                                <div>
                                    <label>CVV</label>
                                    <input type="password" placeholder='123' required minLength={3} maxLength={4} />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'upi' && (
                        <div className="method-details slide-in">
                            <label>UPI ID</label>
                            <input type="text" placeholder='username@bank' required />
                        </div>
                    )}

                    {paymentMethod === 'cod' && (
                        <div className="method-details slide-in">
                            <p className="cod-info">You will pay with cash upon delivery.</p>
                        </div>
                    )}

                    <button type="submit" className="pay-now-btn">{paymentMethod === 'cod' ? 'PLACE ORDER' : 'PAY NOW'}</button>
                    <p className='cancel-btn' onClick={() => setPaymentMode(false)}>Return to details</p>
                </form>
            </div>
        )
    }

    return (
        <form onSubmit={placeOrderHandler} className='place-order'>
            <div className="place-order-left">
                <p className="title">Delivery Information</p>
                {errors.api && <div className="cod-info" style={{ marginBottom: "20px", padding: "10px", fontSize: "14px" }}>{errors.api}</div>}

                <div className="multi-fields">
                    <div className="input-group">
                        <input name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' className={errors.firstName ? 'error-border' : ''} />
                        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>
                    <div className="input-group">
                        <input name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' className={errors.lastName ? 'error-border' : ''} />
                        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                    </div>
                </div>

                <div className="input-group">
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' className={errors.email ? 'error-border' : ''} />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="input-group">
                    <input name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' className={errors.street ? 'error-border' : ''} />
                    {errors.street && <span className="error-text">{errors.street}</span>}
                </div>

                <div className="multi-fields">
                    <div className="input-group" ref={dropdownRef} style={{ position: 'relative' }}>
                        <input name='city' onChange={onCityChangeHandler} onFocus={() => setShowDropdown(true)} value={data.city} type="text" placeholder='City' className={errors.city ? 'error-border' : ''} autoComplete="off" />
                        {errors.city && <span className="error-text">{errors.city}</span>}
                        {showDropdown && citySuggestions.length > 0 && (
                            <ul className="city-dropdown">
                                {citySuggestions.map((s, i) => (
                                    <li key={i} onClick={() => handleCitySelect(s)}>
                                        <p className="city-name">{s.address?.city || s.address?.town || s.address?.village || s.name}</p>
                                        <p className="city-desc">{s.display_name}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="input-group">
                        <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' className={errors.state ? 'error-border' : ''} />
                        {errors.state && <span className="error-text">{errors.state}</span>}
                    </div>
                </div>

                <div className="multi-fields">
                    <div className="input-group">
                        <input name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' className={errors.zipcode ? 'error-border' : ''} />
                        {errors.zipcode && <span className="error-text">{errors.zipcode}</span>}
                    </div>
                    <div className="input-group">
                        <input name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' className={errors.country ? 'error-border' : ''} />
                        {errors.country && <span className="error-text">{errors.country}</span>}
                    </div>
                </div>

                <div className="input-group">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="country-selector-container" ref={countryRef} style={{ position: 'relative' }}>
                            <div
                                className="selected-country"
                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                                {data.countryCode} <span>▼</span>
                            </div>

                            {showCountryDropdown && (
                                <div className="extended-country-dropdown">
                                    <input
                                        type="text"
                                        placeholder="Search country..."
                                        value={countrySearch}
                                        onChange={(e) => setCountrySearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="country-search-input"
                                    />
                                    <ul>
                                        {allCountries
                                            .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch))
                                            .map((c, i) => (
                                                <li key={i} onClick={() => {
                                                    setData(prev => ({ ...prev, countryCode: c.code }));
                                                    setShowCountryDropdown(false);
                                                    setCountrySearch("");
                                                }}>
                                                    <span className="cc-name">{c.name}</span>
                                                    <span className="cc-code">{c.code}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <input name='phone' onChange={onChangeHandler} value={data.phone} type="tel" placeholder='10-digit Phone' className={errors.phone ? 'error-border' : ''} style={{ flex: 1 }} />
                    </div>
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
            </div>

            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>₹ {getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>₹ {getTotalCartAmount() === 0 ? 0 : 2}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Total</b>
                            <b>₹ {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
                        </div>
                    </div>
                    <button type='submit' disabled={isVerifyingLocation}>
                        {isVerifyingLocation ? 'VERIFYING LOCATION...' : 'PROCEED TO PAYMENT'}
                    </button>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder