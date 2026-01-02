import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import logo from "./assets/logo.jpg"; 
import "./Navbar.css"; 

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" onClick={() => navigate("/")} />
        <NavLink to="/creators" className="navbar-text" style={{ textDecoration: 'none' }}>EXPLORE CREATORS</NavLink>
      </div>

      <nav className="nav-links">
        
        {!user && (
          <>
            <NavLink to="/login" className="nav-btn gold-btn">Sign In</NavLink>
            <NavLink to="/creator-signup" className="nav-btn gold-btn">Join as creator</NavLink>
          </>
        )}

        {user && user.role === "customer" && (
          <>
            <NavLink to="/creators">Find Creators</NavLink>
            <NavLink to="/my-bookings">My Bookings</NavLink>

            <NavLink to="/profile" className="profile-link">
              <User size={20} /> Profile
            </NavLink>

            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} /> Logout
            </button>
          </>
        )}

        {user && user.role === "photographer" && (
          <>
            <NavLink to="/bookings">Bookings</NavLink>
            <NavLink to="/portfolio">Portfolio</NavLink>
            <NavLink to={`/photographer/${user._id}/reviews`}>Reviews</NavLink>

            <NavLink to="/profile" className="profile-link">
              <User size={20} /> Profile
            </NavLink>

            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} /> Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
