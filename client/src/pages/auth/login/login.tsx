import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/pages/auth.css";

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData ] = useState({
        email: "",
        password: ""
    });
 
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch("https://discloned.up.railway.app/login", {
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

            navigate("/channels/@me");
        } catch (error) {
            console.error(error);
        }
    };

    return(
        <div className="auth-body">
            <div className="auth-wrapper">
                <h1 className="auth-title margin-bottom-8px">
                    Welcome back!
                </h1>
                <div className="auth-title-caption">
                    We're so excited to see you again!
                </div>
                <form 
                    onSubmit={handleSubmit}
                    className="auth-form"
                >
                    <div className="auth-input-box">
                        <label className="input-label">
                            EMAIL OR PHONE NUMBER
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
                    <div className="auth-input-box reset-margin">
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
                    <button 
                        onClick={() => navigate("/register")}
                        className="btn-link forgot-password"
                    >
                        Forgot your password?
                    </button>

                    <button 
                        type="submit"
                        className="btn reset-margin"
                    >
                        Log in
                    </button>
                    <div className="need-account-container">
                        <span className="need_account">
                            Need an account?&nbsp;
                        </span>
                        <button 
                            onClick={() => navigate("/register")}
                            className="btn-link reset-margin register-btn-link"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}