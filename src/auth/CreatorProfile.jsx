import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import axios from "axios";
import "./CreatorProfile.css";

const CreatorProfile = () => {
  const { user } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    dob: "",
    country: "",
    city: "",
    zipCode: "",
    languages: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL; // Make sure .env has VITE_API_URL=http://localhost:5000

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await clerk.session.getToken();

        const res = await axios.get(
          `${API_URL}/photographers/profile/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // pass Clerk token
            },
          }
        );

        if (res.data.success) {
          const p = res.data.photographer;
          setFormData({
            firstName: p.firstName || "",
            lastName: p.lastName || "",
            gender: p.gender || "",
            phone: p.phone || "",
            dob: p.dob || "",
            country: p.country || "",
            city: p.city || "",
            zipCode: p.zipCode || "",
            languages: p.languages?.join(", ") || "",
            latitude: p.location?.coordinates?.[1] || "",
            longitude: p.location?.coordinates?.[0] || "",
          });
        }
      } catch (err) {
        console.error("Fetch profile error:", err.response?.data || err.message);
        alert("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, clerk, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const token = await clerk.session.getToken();

      const payload = {
        ...formData,
        languages: formData.languages.split(",").map((l) => l.trim()),
      };

      const res = await axios.post(`${API_URL}/photographers/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        alert("Profile saved successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Save profile error:", err.response?.data || err.message);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading user info...</p>;

  return (
    <div className="creator-profile-page">
      <h2>Complete Your Profile</h2>
      <form className="creator-profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />

        <div className="form-row">
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="text"
            name="zipCode"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={handleChange}
          />
        </div>

        <input
          type="text"
          name="languages"
          placeholder="Languages (comma separated)"
          value={formData.languages}
          onChange={handleChange}
        />

        <div className="form-row">
          <input
            type="text"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleChange}
          />
          <input
            type="text"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default CreatorProfile;
