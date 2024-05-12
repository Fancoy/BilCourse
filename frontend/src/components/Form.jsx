import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [accountType, setAccountType] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const isLogin = method === "login";
    const name = isLogin ? "Login" : "Register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const userData = isLogin
            ? { email, password }
            : { email, password, first_name: firstName, last_name: lastName, mobile_number: mobileNumber, account_type: accountType };

        try {
            const res = await api.post(route, userData);
            if (isLogin) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/home");
            } else {
                setMessage("Registration successful! Please check your email for the verification code.");
            }
        } catch (error) {
            setMessage(error.response?.data.detail || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/api/verify-email/", { email, verification_code: verificationCode });
            if (res.status === 200) {
                setMessage("Email verified successfully! You can now log in.");
                navigate("/login");
            } else {
                setMessage("Invalid verification code.");
            }
        } catch (error) {
            setMessage(error.response?.data.detail || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h1>{name}</h1>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                {!isLogin && (
                    <>
                        <input
                            className="form-input"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            required
                        />
                        <input
                            className="form-input"
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder="Mobile Number"
                            required
                        />
                        <select
                            className="form-input"
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                            required={!isLogin}
                        >
                            <option value="">Select Account Type</option>
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </>
                )}
                {loading && <LoadingIndicator />}
                <button className="form-button" type="submit">
                    {name}
                </button>
            </form>

            {!isLogin && (
                <form onSubmit={handleVerifyEmail} className="form-container">
                    <h1>Verify Email</h1>
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
                        Verify Email
                    </button>
                </form>
            )}
        </div>
    );
}

export default Form;
