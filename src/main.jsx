
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

// Global styles
import "./styles/global.css";

// Branding
import "./styles/branding.css";

// Layout styles
import "./styles/sidebar.css";
import "./styles/header.css";

// Page styles
import "./styles/dashboard.css";
import "./styles/pages.css";
import "./styles/analytics.css";
import "./styles/reports.css";
import "./styles/ai-assistant.css";
import "./styles/investments.css";
import "./styles/login.css";
import "./styles/profile.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
