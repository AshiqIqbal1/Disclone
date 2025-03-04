import React, { useState } from "react";
import "../../../assets/css/pages/auth.css"
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import DateSelector from "../../../components/dateSelector/dateSelector";

export default function Register() {

    const navigate = useNavigate();
    const [formData, setFormData ] = useState({
        email: "",
        displayName: "",
        username: "",
        password: "",
        day: "24",
        month: "January",
        year: "2024"
    });
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };
    
    const [checked, setChecked] = useState(false);
    const [activeSelector, setActiveSelector] = useState({
        month: false,
        day: false,
        year: false
    })

    const handleSelectorChange = (field: string) => {
        let day = false;
        let month = false;
        let year = false;

        switch (field) {
            case "month":
                if (!activeSelector.month) {
                    month = true;
                }
                break;
            case "day":
                if (!activeSelector.day) {
                    day = true;
                }
                break;
            case "year":
                if (!activeSelector.year) {
                    year = true;
                }
                break;
        }

        setActiveSelector({
            month: month,
            day: day,
            year: year
        })
    };

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    const days: string[] = Array.from({ length: 32 }, (_, i) => i.toString()); 
    const years = [];
    for (let year = 2022; year >= 1873; year--) {
        years.push(year.toString());
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch("https://discloned.up.railway.app/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.message} Status: ${response.status}`);
            }
            
            const output = await response.json();
            localStorage.setItem("Authorization", output.token);
            navigate("/login");

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-wrapper">
                <h1 className="auth-title">
                    Create an account
                </h1>
                <form 
                    onSubmit={handleSubmit}
                    className="auth-form"
                >
                    <div className="auth-input-box">
                        <label className="input-label">
                            EMAIL
                            <span>*</span>
                        </label>
                        <input
                            type="email"
                            className="input-box"
                            value={formData.email}
                            onChange={(e) => handleChange(e, "email")}
                            required
                        />
                    </div>
                    <div className="auth-input-box">
                        <label className="input-label">DISPLAY NAME</label>
                        <input
                            type="text"
                            className="input-box"
                            value={formData.displayName}
                            onChange={(e) => handleChange(e, "displayName")}
                            required
                        />
                    </div>
                    <div className="auth-input-box">
                        <label className="input-label">
                            USERNAME
                            <span>*</span>
                        </label>
                        <input
                            type="text"
                            className="input-box"
                            value={formData.username}
                            onChange={(e) => handleChange(e, "username")}
                            required
                        />
                    </div>
                    <div className="auth-input-box">
                        <label className="input-label">
                            PASSWORD
                            <span>*</span>
                        </label>
                        <input
                            type="password"
                            className="input-box"
                            value={formData.password}
                            onChange={(e) => handleChange(e, "password")}
                            required
                        />
                    </div>
                    <div className="auth-input-box-date">
                        <label className="input-label">
                            DATE OF BIRTH
                            <span>*</span>
                        </label>
                        <div className="input-date-of-birth-box">
                            <div 
                                className="input-selector-date month"
                                onClick={() => handleSelectorChange("month")}
                            >
                                <DateSelector placeholder="Month" active={activeSelector.month} options={months}/>
                            </div>
                            <div 
                                className="input-selector-date day-and-year"
                                onClick={() => handleSelectorChange("day")}
                            >
                                <DateSelector placeholder="Day" active={activeSelector.day} options={days}/>
                            </div>
                            <div 
                                className="input-selector-date day-and-year"
                                onClick={() => handleSelectorChange("year")}
                            >
                                <DateSelector placeholder="Year" active={activeSelector.year} options={years}/>
                            </div>
                        </div>
                    </div>
                    <div className="auth-caption-notification">
                        <label>
                            <input 
                                type="checkbox"
                                className="input-checkbox"
                                checked={checked}
                                onChange={(e) => setChecked(e.target.checked)}
                            />
                            <span 
                               className={`${checked ? "checked-checkmark" : ""} custom-checkmark`}
                            >
                                {
                                    checked ?
                                    (
                                        <FontAwesomeIcon 
                                            icon={faCheck}
                                            className="checked-checkmark-icon"
                                        />
                                    ):
                                    ""
                                }
                            </span>
                            <div className="notification-caption-text">
                                (Optional) It’s okay to send me emails with Discord updates, tips, and special offers. You can opt out at any time.
                            </div>
                        </label>
                    </div>
                    <button 
                        type="submit"
                        className="btn"
                    >
                        Continue
                    </button>
                    <p>
                        By registering, you agree to Discord's <span>Terms of Service</span> and&nbsp;
                        <span>Privacy Policy</span>.
                    </p>
                    <button 
                        className="btn-link"
                        onClick={() => navigate("/login")}
                    >
                        Already have an account?
                    </button>
                </form>
            </div>
        </div>
    );
}