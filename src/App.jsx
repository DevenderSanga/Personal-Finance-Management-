import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Savings from "./pages/Savings";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Investments from "./pages/Investments";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

import { ThemeProvider } from "./context/ThemeContext";
import { FinanceProvider } from "./context/FinanceContext";

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <main className="main-content">
                <Header
                    setSidebarOpen={setSidebarOpen}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/savings" element={<Savings />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/ai-assistant" element={<AIAssistant />} />
                    <Route path="/investments" element={<Investments />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <FinanceProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={<MainLayout />} />
                </Routes>
            </FinanceProvider>
        </ThemeProvider>
    );
}

export default App;