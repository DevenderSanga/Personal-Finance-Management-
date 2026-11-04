import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    FiMenu,
    FiSun,
    FiMoon,
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiX
} from "react-icons/fi";

import { useTheme } from "../context/ThemeContext";

const pageTitles = {
    "/": "Dashboard",
    "/income": "Income Management",
    "/expenses": "Expense Tracking",
    "/budgets": "Budget Planning",
    "/savings": "Savings Goals",
    "/investments": "Investment Portfolio",
    "/transactions": "Transaction History",
    "/analytics": "Spending Analytics",
    "/reports": "Financial Reports",
    "/ai-assistant": "AI Financial Assistant",
    "/settings": "Settings",
    "/profile": "My Profile"
};

const defaultNotifications = [
    {
        id: 1,
        title: "Welcome to Finora!",
        message: "Your personal finance dashboard is ready to use.",
        time: "Just now",
        read: false
    },
    {
        id: 2,
        title: "Investment Portfolio",
        message: "Track your investments and portfolio performance.",
        time: "Today",
        read: false
    },
    {
        id: 3,
        title: "Financial Reports",
        message: "Review your monthly financial reports and spending trends.",
        time: "Yesterday",
        read: false
    },
    {
        id: 4,
        title: "AI Financial Assistant",
        message: "Explore personalized insights based on your finance data.",
        time: "Yesterday",
        read: true
    }
];

const DEFAULT_PROFILE = {
    name: "Dev",
    email: "dev@example.com"
};

function getSavedNotifications() {
    try {
        const saved = localStorage.getItem("finwise-notifications");
        return saved ? JSON.parse(saved) : defaultNotifications;
    } catch {
        return defaultNotifications;
    }
}

function getProfile() {
    try {
        return {
            ...DEFAULT_PROFILE,
            ...JSON.parse(localStorage.getItem("finwise_profile") || "{}")
        };
    } catch {
        return DEFAULT_PROFILE;
    }
}

function Header({ setSidebarOpen }) {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        theme,
        toggleTheme,
        direction,
        toggleDirection
    } = useTheme();

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(getSavedNotifications);
    const [profile, setProfile] = useState(getProfile);

    const title = pageTitles[location.pathname] || "Finora";

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const profileInitial = profile.name?.trim()
        ? profile.name.trim().charAt(0).toUpperCase()
        : "D";

    useEffect(() => {
        localStorage.setItem(
            "finwise-notifications",
            JSON.stringify(notifications)
        );
    }, [notifications]);

    useEffect(() => {
        const updateProfile = (event) => {
            setProfile(event.detail);
        };

        window.addEventListener("finwise-profile-updated", updateProfile);

        return () => {
            window.removeEventListener(
                "finwise-profile-updated",
                updateProfile
            );
        };
    }, []);

    const markAllAsRead = () => {
        setNotifications((current) =>
            current.map((notification) => ({
                ...notification,
                read: true
            }))
        );
    };

    const markAsRead = (id) => {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <button
                    className="menu-toggle"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <FiMenu />
                </button>

                <div>
                    <h2>{title}</h2>
                    <p>Welcome back! Here's your financial overview.</p>
                </div>
            </div>

            <div className="header-right">
                <button
                    className="header-action direction-action"
                    onClick={toggleDirection}
                    title={`Switch to ${direction === "ltr" ? "RTL" : "LTR"}`}
                    aria-label="Toggle layout direction"
                >
                    <span className="direction-label">
                        {direction.toUpperCase()}
                    </span>
                </button>

                <button
                    className="header-action"
                    onClick={toggleTheme}
                    title="Toggle theme"
                    aria-label="Toggle theme"
                >
                    {theme === "light" ? <FiMoon /> : <FiSun />}
                </button>

                <div className="notification-wrapper">
                    <button
                        className="header-action notification-action"
                        onClick={() => setShowNotifications((current) => !current)}
                        title="Notifications"
                        aria-label="Notifications"
                        aria-expanded={showNotifications}
                    >
                        <FiBell />

                        {unreadCount > 0 && (
                            <span className="notification-count">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <div>
                                    <h3>Notifications</h3>
                                    <p>
                                        {unreadCount} unread update
                                        {unreadCount !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                <button
                                    className="notification-close"
                                    onClick={() => setShowNotifications(false)}
                                    aria-label="Close notifications"
                                >
                                    <FiX />
                                </button>
                            </div>

                            {notifications.length > 0 ? (
                                <>
                                    <div className="notification-list">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`notification-item ${
                                                    notification.read ? "read" : "unread"
                                                }`}
                                            >
                                                <div className="notification-icon">
                                                    <FiCheckCircle />
                                                </div>

                                                <div className="notification-content">
                                                    <h4>{notification.title}</h4>
                                                    <p>{notification.message}</p>
                                                    <span>{notification.time}</span>
                                                </div>

                                                {!notification.read && (
                                                    <button
                                                        className="notification-mark"
                                                        onClick={() => markAsRead(notification.id)}
                                                        title="Mark as read"
                                                        aria-label="Mark as read"
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="notification-footer">
                                        <button
                                            onClick={markAllAsRead}
                                            disabled={unreadCount === 0}
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-notifications">
                                    <FiBell />
                                    <p>No notifications yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="header-user-avatar"
                    onClick={() => navigate("/profile")}
                    title={`Open ${profile.name || "My Profile"}`}
                    aria-label="Open My Profile"
                >
                    {profileInitial}
                </button>
            </div>
        </header>
    );
}

export default Header;