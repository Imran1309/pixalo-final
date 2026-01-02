import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./FindCreators.css";

const FindCreators = () => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Read query params
  const queryParams = new URLSearchParams(location.search);
  const lat = queryParams.get("lat");
  const lng = queryParams.get("lng");
  const city = queryParams.get("city");

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL; // 👈 using env

        let url = `${API_URL}/api/photographers/`;

        // If lat/lng available, fetch nearby
        if (lat && lng) {
          url = `${API_URL}/api/photographers/nearby?lat=${lat}&lng=${lng}`;
        }

        const res = await axios.get(url);
        setPhotographers(res.data.photographers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
  }, [lat, lng]);

  if (loading) return <p className="loading">Loading creators...</p>;

  return (
    <div className="creators-container">
      {photographers.length === 0 && <p>No photographers found.</p>}
      {photographers.map((p) => (
        <div key={p._id} className="creator-card">
          <h3>{p.userId?.name || "Unnamed"}</h3>
          <p>
            <b>Type of Work:</b>{" "}
            {p.typeOfWork === "Both"
              ? "Photographer, Videographer"
              : p.typeOfWork}
          </p>
          <p>
            <b>Experience:</b> {p.yearsOfExperience} years
          </p>
          <p className="intro">{p.introduction?.slice(0, 60)}...</p>
          <button onClick={() => navigate(`/photographer/${p._id}`)}>
            View Profile
          </button>
        </div>
      ))}
    </div>
  );
};

export default FindCreators;
