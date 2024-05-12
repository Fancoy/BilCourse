import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import "../styles/Form.css";
import LoadingIndicator from "../components/LoadingIndicator";

function VerifyEmail() {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/api/verify-email/', { email, verification_code: verificationCode });
            setMessage(res.data.message);
            navigate("/login");
        } catch (error) {
            setMessage(error.response?.data.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Verify Email</h1>
            {message && <p>{message}</p>}
            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                className="form-input"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Verification Code"
                required
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                Verify
            </button>
        </form>
    );
}

export default VerifyEmail;
