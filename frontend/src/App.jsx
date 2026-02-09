import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import ItemList from "./components/ItemList";
import toast from "react-hot-toast";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Verify token on app load
      fetch("/api/users/login", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      });
    }
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    toast.success("Logged in successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully!");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar token={token} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <ItemList token={token} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
