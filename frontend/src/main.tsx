import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Add global debug function for login troubleshooting
(window as any).checkLoginLogs = () => {
  const logs = {
    login_response: sessionStorage.getItem('login_response'),
    login_inner_data: sessionStorage.getItem('login_inner_data'),
    auth_login_success: sessionStorage.getItem('auth_login_success'),
    auth_login_completed: sessionStorage.getItem('auth_login_completed'),
    login_error: sessionStorage.getItem('login_error'),
    auth_login_error: sessionStorage.getItem('auth_login_error'),
    localStorage_user: localStorage.getItem('user'),
    localStorage_token: localStorage.getItem('token') ? 'EXISTS' : 'NOT FOUND'
  };

  console.log("🔍 LOGIN DEBUG LOGS:", logs);
  alert(`Debug Logs:\n\n${JSON.stringify(logs, null, 2)}\n\nCheck console for full details.`);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
