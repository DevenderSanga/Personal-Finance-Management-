import { useNavigate } from "react-router-dom";
import {
    FiLock,
    FiMail,
    FiArrowRight
} from "react-icons/fi";

import Logo from "../components/Logo";
import "../styles/login.css";

function Login() {
    const navigate = useNavigate();

    const handleLogin = (event) => {
        event.preventDefault();
        navigate("/");
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <Logo
                    className="finora-logo-login"
                    showTagline
                />

                <div className="login-heading">
                    <h1>Welcome back!</h1>
                    <p>
                        Sign in to continue managing your finances with Finora.
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <label htmlFor="email">Email address</label>

                    <div className="login-input">
                        <FiMail />
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <label htmlFor="password">Password</label>

                    <div className="login-input">
                        <FiLock />
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-submit">
                        Continue to Finora
                        <FiArrowRight />
                    </button>
                </form>

                <p className="login-demo-note">
                    Demo interface only. No account verification is performed.
                </p>
            </div>
        </div>
    );
}

export default Login;