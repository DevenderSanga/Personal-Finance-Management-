
import { useEffect, useState } from "react";

import {
    FiUser,
    FiMoon,
    FiSun,
    FiBell,
    FiDownload,
    FiRefreshCw,
    FiShield,
    FiSave,
    FiCheckCircle,
    FiGlobe,
    FiTrendingUp,
    FiPieChart,
    FiZap,
} from "react-icons/fi";

import { useTheme } from "../context/ThemeContext";
import { useFinance } from "../context/FinanceContext";

import "../styles/settings.css";

const DEFAULT_PROFILE = {
    name: "Dev",
    email: "dev@example.com",
    phone: "",
};

const DEFAULT_NOTIFICATIONS = {
    budgetAlerts: true,
    savingsUpdates: true,
    weeklySummary: false,
    productUpdates: false,
};

function readSettings(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        return saved
            ? { ...fallback, ...JSON.parse(saved) }
            : fallback;
    } catch {
        return fallback;
    }
}

function Settings() {
    const { theme, toggleTheme } = useTheme();

    const {
        income = [],
        expenses = [],
        budgets = [],
        savingsGoals = [],
        investments = [],
    } = useFinance();

    const [profile, setProfile] = useState(() =>
        readSettings("finwise_profile", DEFAULT_PROFILE)
    );

    const [notifications, setNotifications] = useState(() =>
        readSettings(
            "finwise_notifications",
            DEFAULT_NOTIFICATIONS
        )
    );

    const [direction, setDirection] = useState(() =>
        localStorage.getItem("finwise-direction") || "ltr"
    );

    const [savedMessage, setSavedMessage] = useState("");

    // Apply and save layout direction
    useEffect(() => {
        document.documentElement.setAttribute("dir", direction);
        localStorage.setItem("finwise-direction", direction);
    }, [direction]);

    // Save profile and update Header / Sidebar
    useEffect(() => {
        localStorage.setItem(
            "finwise_profile",
            JSON.stringify(profile)
        );

        window.dispatchEvent(
            new CustomEvent("finwise-profile-updated", {
                detail: profile,
            })
        );
    }, [profile]);

    // Save notifications
    useEffect(() => {
        localStorage.setItem(
            "finwise_notifications",
            JSON.stringify(notifications)
        );
    }, [notifications]);

    const updateProfile = (field, value) => {
        setProfile((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateNotification = (field) => {
        setNotifications((current) => ({
            ...current,
            [field]: !current[field],
        }));
    };

    const handleSaveProfile = (event) => {
        event.preventDefault();

        localStorage.setItem(
            "finwise_profile",
            JSON.stringify(profile)
        );

        window.dispatchEvent(
            new CustomEvent("finwise-profile-updated", {
                detail: profile,
            })
        );

        setSavedMessage("Your Finora profile settings have been saved.");

        setTimeout(() => {
            setSavedMessage("");
        }, 2500);
    };

    // Export finance data
    const handleExport = () => {
        const exportData = {
            application: "Finora",
            exportedAt: new Date().toISOString(),
            profile,
            notifications,
            direction,
            income,
            expenses,
            budgets,
            savingsGoals,
            investments,
        };

        const blob = new Blob(
            [JSON.stringify(exportData, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "finora-financial-data.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    // Reset application
    const handleReset = () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset Finora? Your added records and settings will be removed and the original demo data will be restored."
        );

        if (!confirmed) return;

        [
            "finwise_income",
            "finwise_expenses",
            "finwise_budgets",
            "finwise_savings_goals",
            "finwise_investments",
            "finwise_profile",
            "finwise_notifications",
            "finwise-direction",
        ].forEach((key) => {
            localStorage.removeItem(key);
        });

        window.location.reload();
    };

    // Finora feature updates
    const updates = [
        {
            id: 1,
            type: "NEW FEATURE",
            title: "Investment Portfolio",
            description:
                "Track stocks, mutual funds, gold and other investments from one portfolio.",
            date: "New feature",
            icon: <FiTrendingUp />,
        },
        {
            id: 2,
            type: "NEW FEATURE",
            title: "Financial Reports",
            description:
                "Review monthly and yearly income, expenses, savings and budget performance.",
            date: "New feature",
            icon: <FiPieChart />,
        },
        {
            id: 3,
            type: "IMPROVEMENT",
            title: "AI Financial Assistant",
            description:
                "Get helpful spending insights, budget suggestions and personalized financial tips.",
            date: "Improvement",
            icon: <FiZap />,
        },
        {
            id: 4,
            type: "IMPROVEMENT",
            title: "Personalized Dashboard",
            description:
                "View your financial overview, recent transactions and spending activity in one place.",
            date: "Improvement",
            icon: <FiGlobe />,
        },
    ];

    return (
        <div className="settings-page">

            {/* Page Heading */}
            <div className="settings-page-heading">
                <div>
                    <span className="settings-eyebrow">
                        PREFERENCES
                    </span>

                    <h1>Settings</h1>

                    <p>
                        Manage your profile and customize your Finora experience.
                    </p>
                </div>
            </div>

            {/* Success Message */}
            {savedMessage && (
                <div className="settings-success-message">
                    <FiCheckCircle />
                    {savedMessage}
                </div>
            )}

            <div className="settings-layout">

                {/* LEFT COLUMN */}
                <div className="settings-main-column">

                    {/* PROFILE SETTINGS */}
                    <section className="settings-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                <FiUser />
                            </div>

                            <div>
                                <h2>Profile Information</h2>
                                <p>
                                    Update your personal account details.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile}>

                            <div className="settings-form-grid">

                                <div className="settings-field">
                                    <label htmlFor="profile-name">
                                        Full Name
                                    </label>

                                    <input
                                        id="profile-name"
                                        value={profile.name}
                                        onChange={(e) =>
                                            updateProfile("name", e.target.value)
                                        }
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="profile-email">
                                        Email Address
                                    </label>

                                    <input
                                        id="profile-email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) =>
                                            updateProfile("email", e.target.value)
                                        }
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="profile-phone">
                                        Phone Number
                                    </label>

                                    <input
                                        id="profile-phone"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) =>
                                            updateProfile("phone", e.target.value)
                                        }
                                        placeholder="Enter phone number"
                                    />
                                </div>

                            </div>

                            <div className="settings-card-footer">
                                <button
                                    className="settings-primary-button"
                                    type="submit"
                                >
                                    <FiSave />
                                    Save Changes
                                </button>
                            </div>

                        </form>
                    </section>

                    {/* APPEARANCE */}
                    <section className="settings-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                {theme === "dark" ? <FiMoon /> : <FiSun />}
                            </div>

                            <div>
                                <h2>Appearance</h2>
                                <p>
                                    Choose how Finora looks on your device.
                                </p>
                            </div>
                        </div>

                        <div className="settings-theme-options">

                            <button
                                type="button"
                                className={`settings-theme-option ${theme === "light" ? "active" : ""}`}
                                onClick={() => {
                                    if (theme !== "light") toggleTheme();
                                }}
                            >
                                <FiSun />

                                <span>
                                    <strong>Light Mode</strong>
                                    <small>
                                        Clean and bright appearance
                                    </small>
                                </span>

                                {theme === "light" && <FiCheckCircle />}
                            </button>

                            <button
                                type="button"
                                className={`settings-theme-option ${theme === "dark" ? "active" : ""}`}
                                onClick={() => {
                                    if (theme !== "dark") toggleTheme();
                                }}
                            >
                                <FiMoon />

                                <span>
                                    <strong>Dark Mode</strong>
                                    <small>
                                        Comfortable low-light appearance
                                    </small>
                                </span>

                                {theme === "dark" && <FiCheckCircle />}
                            </button>

                        </div>
                    </section>

                    {/* LTR / RTL DIRECTION */}
                    <section className="settings-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                <FiGlobe />
                            </div>

                            <div>
                                <h2>Layout Direction</h2>
                                <p>
                                    Choose the reading and navigation direction.
                                </p>
                            </div>
                        </div>

                        <div className="settings-direction-options">

                            <button
                                type="button"
                                className={`settings-direction-option ${direction === "ltr" ? "active" : ""}`}
                                onClick={() => setDirection("ltr")}
                            >
                                <strong>LTR</strong>
                                <span>Left to Right</span>
                                <small>
                                    English and other left-to-right languages
                                </small>
                                {direction === "ltr" && <FiCheckCircle />}
                            </button>

                            <button
                                type="button"
                                className={`settings-direction-option ${direction === "rtl" ? "active" : ""}`}
                                onClick={() => setDirection("rtl")}
                            >
                                <strong>RTL</strong>
                                <span>Right to Left</span>
                                <small>
                                    Arabic, Hebrew and other right-to-left languages
                                </small>
                                {direction === "rtl" && <FiCheckCircle />}
                            </button>

                        </div>
                    </section>

                    {/* NOTIFICATIONS */}
                    <section className="settings-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                <FiBell />
                            </div>

                            <div>
                                <h2>Notifications</h2>
                                <p>
                                    Choose which updates you want to receive.
                                </p>
                            </div>
                        </div>

                        <div className="settings-notification-list">

                            {[
                                {
                                    key: "budgetAlerts",
                                    title: "Budget Alerts",
                                    description:
                                        "Get notified when spending approaches your budget.",
                                },
                                {
                                    key: "savingsUpdates",
                                    title: "Savings Goal Updates",
                                    description:
                                        "Receive updates about your savings progress.",
                                },
                                {
                                    key: "weeklySummary",
                                    title: "Weekly Financial Summary",
                                    description:
                                        "Review your income and expenses each week.",
                                },
                                {
                                    key: "productUpdates",
                                    title: "New Finora Feature Updates",
                                    description:
                                        "Get notified when new features and improvements are released.",
                                },
                            ].map((item) => (
                                <div
                                    className="settings-notification-row"
                                    key={item.key}
                                >
                                    <div>
                                        <strong>{item.title}</strong>
                                        <p>{item.description}</p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={notifications[item.key]}
                                        aria-label={item.title}
                                        className={`settings-switch ${notifications[item.key] ? "enabled" : ""}`}
                                        onClick={() =>
                                            updateNotification(item.key)
                                        }
                                    >
                                        <span />
                                    </button>
                                </div>
                            ))}

                        </div>
                    </section>

                    {/* WHAT'S NEW */}
                    <section className="settings-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                <FiZap />
                            </div>

                            <div>
                                <h2>What's New in Finora</h2>
                                <p>
                                    Discover the latest features and improvements.
                                </p>
                            </div>
                        </div>

                        <div className="settings-update-list">

                            {updates.map((update) => (
                                <div
                                    className="settings-update-item"
                                    key={update.id}
                                >
                                    <div className="settings-update-top">
                                        <div className="settings-update-icon">
                                            {update.icon}
                                        </div>

                                        <span className="settings-update-tag">
                                            {update.type}
                                        </span>
                                    </div>

                                    <h3>{update.title}</h3>

                                    <p>{update.description}</p>

                                    <small>{update.date}</small>
                                </div>
                            ))}

                        </div>

                        <div className="settings-update-footer">
                            <FiBell />

                            <span>
                                Enable New Finora Feature Updates above
                                to save your notification preference.
                            </span>
                        </div>

                    </section>

                </div>

                {/* RIGHT COLUMN */}
                <div className="settings-side-column">

                    {/* DATA MANAGEMENT */}
                    <section className="settings-card settings-data-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                <FiDownload />
                            </div>

                            <div>
                                <h2>Data Management</h2>
                                <p>
                                    Keep a backup of your financial records.
                                </p>
                            </div>
                        </div>

                        <div className="settings-data-info">

                            <div>
                                <span>Income records</span>
                                <strong>{income.length}</strong>
                            </div>

                            <div>
                                <span>Expense records</span>
                                <strong>{expenses.length}</strong>
                            </div>

                            <div>
                                <span>Budgets</span>
                                <strong>{budgets.length}</strong>
                            </div>

                            <div>
                                <span>Savings goals</span>
                                <strong>{savingsGoals.length}</strong>
                            </div>

                            <div>
                                <span>Investments</span>
                                <strong>{investments.length}</strong>
                            </div>

                        </div>

                        <button
                            type="button"
                            className="settings-primary-button settings-full-button"
                            onClick={handleExport}
                        >
                            <FiDownload />
                            Export My Data
                        </button>

                        <small className="settings-helper-text">
                            Downloads your Finora records as a JSON backup file.
                        </small>

                    </section>

                    {/* PRIVACY */}
                    <section className="settings-card settings-security-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                <FiShield />
                            </div>

                            <div>
                                <h2>Privacy & Security</h2>
                                <p>
                                    Understand how this demo stores your data.
                                </p>
                            </div>
                        </div>

                        <p className="settings-security-note">
                            Finora currently stores your profile, preferences,
                            and finance records in this browser using localStorage.
                            This frontend demo does not use a server or real
                            account authentication.
                        </p>

                    </section>

                    {/* RESET */}
                    <section className="settings-card settings-danger-card">

                        <div className="settings-card-heading">
                            <div className="settings-icon">
                                <FiRefreshCw />
                            </div>

                            <div>
                                <h2>Reset Demo Data</h2>
                                <p>
                                    Restore the original sample records.
                                </p>
                            </div>
                        </div>

                        <p className="settings-danger-description">
                            This removes records and preferences you added
                            and restores the original Finora demo data.
                        </p>

                        <button
                            type="button"
                            className="settings-danger-button"
                            onClick={handleReset}
                        >
                            <FiRefreshCw />
                            Reset Application
                        </button>

                    </section>

                </div>
            </div>
        </div>
    );
}

export default Settings;
