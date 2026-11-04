import { Link } from "react-router-dom";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiEdit,
    FiArrowLeft,
    FiShield
} from "react-icons/fi";

import "../styles/profile.css";

const DEFAULT_PROFILE = {
    name: "Dev",
    email: "dev@example.com",
    phone: ""
};

function getProfile() {
    try {
        const saved = localStorage.getItem("finwise_profile");
        return saved
            ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) }
            : DEFAULT_PROFILE;
    } catch {
        return DEFAULT_PROFILE;
    }
}

function Profile() {
    const profile = getProfile();

    const initial = profile.name?.trim()
        ? profile.name.trim().charAt(0).toUpperCase()
        : "D";

    return (
        <div className="profile-page">
            <div className="profile-page-heading">
                <div>
                    <span className="profile-eyebrow">ACCOUNT</span>
                    <h1>My Profile</h1>
                    <p>View your personal information and account details.</p>
                </div>

                <Link to="/" className="profile-back-button">
                    <FiArrowLeft />
                    Dashboard
                </Link>
            </div>

            <section className="profile-card">
                <div className="profile-cover" />

                <div className="profile-main">
                    <div className="profile-avatar-large">
                        {initial}
                    </div>

                    <div className="profile-main-info">
                        <h2>{profile.name || "Your Name"}</h2>
                        <p>Personal Account</p>
                    </div>

                    <Link to="/settings" className="profile-edit-button">
                        <FiEdit />
                        Edit Profile
                    </Link>
                </div>

                <div className="profile-divider" />

                <div className="profile-details">
                    <h3>Personal Information</h3>

                    <div className="profile-detail-grid">
                        <div className="profile-detail-item">
                            <div className="profile-detail-icon">
                                <FiUser />
                            </div>
                            <div>
                                <span>Full Name</span>
                                <strong>{profile.name || "Not provided"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="profile-detail-icon">
                                <FiMail />
                            </div>
                            <div>
                                <span>Email Address</span>
                                <strong>{profile.email || "Not provided"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="profile-detail-icon">
                                <FiPhone />
                            </div>
                            <div>
                                <span>Phone Number</span>
                                <strong>{profile.phone || "Not provided"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="profile-detail-icon">
                                <FiShield />
                            </div>
                            <div>
                                <span>Account Type</span>
                                <strong>Personal Account</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card-footer">
                    <p>
                        Your profile information is stored locally in this browser.
                    </p>
                    <Link to="/settings">Manage account settings</Link>
                </div>
            </section>
        </div>
    );
}

export default Profile;