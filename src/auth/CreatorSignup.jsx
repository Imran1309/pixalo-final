import React from "react";
import { useNavigate } from "react-router-dom";
import { SignUp, useSignUp } from "@clerk/clerk-react";
import creatorsignup from "../assets/creatorsingup.jpg";
import "./CreatorSignup.css";

const CreatorSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useSignUp(); // To get the created user

  const handleAfterSignUp = async (user) => {
    try {
      // Get Clerk user email
      const email = user.emailAddresses[0].emailAddress;

      // Prepare payload to send to backend
      const payload = {
        email,
        role: "photographer", // automatically set creator role
      };

      // Use VITE_API_URL from environment
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      console.log("User created on backend:", data);
      navigate("/creator-profile"); // redirect after successful backend creation
    } catch (err) {
      console.error("Error creating user:", err.message);
      alert("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="creator-signup-page">
      {/* Left: Signup Form */}
      <div className="creator-signup-card">
        <div className="signup-header">
          <h2>Creator Registration</h2>
          <p>
            Already have an account?{" "}
            <span
              className="signup-link"
              onClick={() => navigate("/creator-login")}
            >
              Login here
            </span>
          </p>
        </div>

        {/* Clerk SignUp Component */}
        <SignUp
          path="/creator-signup"
          routing="path"
          signInUrl="/creator-login"
          redirectUrl="/creator-profile"
          afterSignUp={(user) => handleAfterSignUp(user)}
        />
      </div>

      {/* Right: Image */}
      <div className="creator-signup-image">
        <img src={creatorsignup} alt="Creator Signup" />
      </div>
    </div>
  );
};

export default CreatorSignup;
