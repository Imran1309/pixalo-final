import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Profile.css";
import defaultProfile from "../assets/default-profile-pic.png";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [city, setCity] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    languages: [],
    country: "",
    latitude: "",
    longitude: "",
    profilePic: "", // URL or File
  });

  const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;




  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setUser(data);

        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          languages: data.languages || [],
          country: data.country || "",
          latitude: data?.location?.coordinates?.[1] || "",
          longitude: data?.location?.coordinates?.[0] || "",
          profilePic: data.profilePic || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  /* ---------------- GEOLOCATION ---------------- */
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  /* ---------------- REVERSE GEOCODE ---------------- */
  useEffect(() => {
    const fetchCity = async () => {
      if (formData.latitude && formData.longitude) {
        try {
          const res = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${formData.latitude}+${formData.longitude}&key=${OPENCAGE_API_KEY}`
          );

          const comp = res.data.results[0].components;
          setCity(comp.city || comp.town || comp.village || "");
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchCity();
  }, [formData.latitude, formData.longitude]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLanguage = (e) => {
    const value = e.target.value;
    if (value && !formData.languages.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, value],
      }));
    }
    e.target.value = "";
  };

  const removeLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const removeProfilePic = () => {
    setFormData((prev) => ({ ...prev, profilePic: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePic: file }));
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      form.append("name", formData.name);
      form.append("phone", formData.phone);
      form.append("gender", formData.gender);
      form.append("country", formData.country);
      form.append("latitude", formData.latitude);
      form.append("longitude", formData.longitude);

      formData.languages.forEach((lang) => form.append("languages", lang));

      // Only send image if file selected
      if (formData.profilePic instanceof File) {
        form.append("profilePic", formData.profilePic);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  if (!user) return <p>Loading...</p>;

  /* ---------------- UI ---------------- */
  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* PROFILE PICTURE */}
        <label>Profile Picture</label>

        <div className="profile-pic-preview">
          <img
            src={
              formData.profilePic
                ? formData.profilePic instanceof File
                  ? URL.createObjectURL(formData.profilePic)
                  : formData.profilePic
                : defaultProfile
            }
            alt="Profile"
            className="preview-img"
          />

          {/* {formData.profilePic && formData.profilePic !== defaultProfile && (
            <button
              type="button"
              className="remove-btn"
              onClick={removeProfilePic}
            >
              Remove
            </button>
          )} */}
        </div>

        {/* Upload New */}
        <input type="file" accept="image/*" onChange={handleImageChange} />

        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input type="email" value={formData.email} disabled />

        <label>Phone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        <label>Languages</label>
        <div className="languages-container">
          {formData.languages.map((lang) => (
            <span
              key={lang}
              className="language-badge"
              onClick={() => removeLanguage(lang)}
            >
              {lang} ×
            </span>
          ))}

          <select onChange={handleAddLanguage}>
            <option value="">Add language</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <label>Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
        />

        <label>Location (auto)</label>
        <p>
          Latitude: {formData.latitude}, Longitude: {formData.longitude}
        </p>
        <p>City: {city || "Detecting city..."}</p>

        <button type="submit">Update Profile</button>
      </form>

      {/* ---------------- CHANGE PASSWORD ---------------- */}
      <h3 className="section-title">Change Password</h3>

      <form
        className="change-password-form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const token = localStorage.getItem("token");

            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  currentPassword,
                  newPassword,
                }),
              }
            );

            const data = await res.json();

            if (res.ok) {
              toast.success("Password changed successfully!");
              setCurrentPassword("");
              setNewPassword("");
            } else {
              toast.error(data.message || "Failed to change password");
            }
          } catch (err) {
            toast.error("Server error");
            console.log(err);
          }
        }}
      >
        <label>Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <label style={{ marginTop: "8px" }}>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit" className="change-password-btn">
          Change Password
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Profile;
