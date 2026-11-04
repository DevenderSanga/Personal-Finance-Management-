
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
    FiGrid,
    FiTrendingUp,
    FiTrendingDown,
    FiTarget,
    FiDollarSign,
    FiBriefcase,
    FiRepeat,
    FiPieChart,
    FiFileText,
    FiMessageCircle,
    FiSettings,
    FiLogOut,
    FiX,
} from "react-icons/fi";

import Logo from "./Logo";

const menuGroups = [
    {
        title: "OVERVIEW",
        items: [
            { name: "Dashboard", path: "/", icon: <FiGrid /> },
        ],
    },
    {
        title: "MONEY MANAGEMENT",
        items: [
            { name: "Income", path: "/income", icon: <FiTrendingUp /> },
            { name: "Expenses", path: "/expenses", icon: <FiTrendingDown /> },
            { name: "Budgets", path: "/budgets", icon: <FiTarget /> },
            { name: "Savings Goals", path: "/savings", icon: <FiDollarSign /> },
            { name: "Investments", path: "/investments", icon: <FiBriefcase /> },
        ],
    },
    {
        title: "ACTIVITY & REPORTS",
        items: [
            { name: "Transactions", path: "/transactions", icon: <FiRepeat /> },
            { name: "Analytics", path: "/analytics", icon: <FiPieChart /> },
            { name: "Reports", path: "/reports", icon: <FiFileText /> },
            { name: "AI Assistant", path: "/ai-assistant", icon: <FiMessageCircle /> },
        ],
    },
    {
        title: "PREFERENCES",
        items: [
            { name: "Settings", path: "/settings", icon: <FiSettings /> },
        ],
    },
];

const DEFAULT_PROFILE = {
    name: "Dev",
    email: "dev@example.com",
};

function getProfile() {
    try {
        return {
            ...DEFAULT_PROFILE,
            ...JSON.parse(
                localStorage.getItem("finwise_profile") || "{}"
            ),
        };
    } catch {
        return DEFAULT_PROFILE;
    }
}

function Sidebar({ isOpen, setIsOpen }) {
    const [profile, setProfile] = useState(getProfile);

    useEffect(() => {
        const updateProfile = (event) => {
            setProfile({
                ...DEFAULT_PROFILE,
                ...event.detail,
            });
        };

        window.addEventListener(
            "finwise-profile-updated",
            updateProfile
        );

        return () => {
            window.removeEventListener(
                "finwise-profile-updated",
                updateProfile
            );
        };
    }, []);

    // Close sidebar with Escape key on mobile
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [setIsOpen]);

    const profileInitial = profile.name?.trim()
        ? profile.name.trim().charAt(0).toUpperCase()
        : "D";

    return (
        <>
            <button
                type="button"
                className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                tabIndex={isOpen ? 0 : -1}
            />

            <aside
                className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
                aria-label="Main navigation"
            >
                <div className="sidebar-brand">
                    <Logo
                        className="finora-logo-sidebar"
                        showTagline={false}
                    />

                    <button
                        type="button"
                        className="sidebar-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                    >
                        <FiX />
                    </button>
                </div>

                <nav className="sidebar-navigation">
                    {menuGroups.map((group) => (
                        <div
                            className="sidebar-group"
                            key={group.title}
                        >
                            <p className="sidebar-group-title">
                                {group.title}
                            </p>

                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `sidebar-link ${
                                            isActive ? "active" : ""
                                        }`
                                    }
                                >
                                    <span className="sidebar-link-icon">
                                        {item.icon}
                                    </span>

                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <NavLink
                        to="/profile"
                        className="sidebar-user sidebar-profile-link"
                        onClick={() => setIsOpen(false)}
                        title="Open My Profile"
                    >
                        <div className="user-avatar">
                            {profileInitial}
                        </div>

                        <div className="sidebar-user-details">
                            <h4>{profile.name || "Your Name"}</h4>
                            <span>Personal Account</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/login"
                        className="sidebar-logout"
                        onClick={() => setIsOpen(false)}
                    >
                        <FiLogOut />
                        <span>Logout</span>
                    </NavLink>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
