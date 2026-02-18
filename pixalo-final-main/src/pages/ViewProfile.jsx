import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewProfile.css";

const ViewProfile = () => {
  const { userId } = useParams();
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is logged in and fetch photographer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/photographers/profile/by-id/${userId}`
        );
        setPhotographer(res.data.photographer);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId, navigate]);

  // Handle Book Now click
  const handleBookNow = (service) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    navigate(`/book/${userId}/${service._id}`, {
      state: { service, photographer: photographer.userId },
    });
  };

  const handleViewReviews = () => {
    navigate(`/photographer/${photographer.userId}/reviews`);
  };

  if (loading) return <p className="vp-loading">Loading profile...</p>;
  if (error) return <p className="vp-error">{error}</p>;
  if (!photographer) return <p className="vp-error">No photographer found.</p>;

  return (
    <div className="vp-container">
      <h1 className="vp-name">
        {photographer.userId?.name || "Photographer Profile"}
      </h1>

      <p className="vp-intro">
        {photographer.introduction || "No introduction provided."}
      </p>

      <div className="vp-details">
        <p>
          <b>Type of Work:</b>{" "}
          {photographer.typeOfWork === "Both"
            ? "Photographer, Videographer"
            : photographer.typeOfWork || "Not set"}
        </p>
        <p>
          <b>Experience:</b> {photographer.yearsOfExperience || 0} years
        </p>
        <p>
          <b>Specializations:</b>{" "}
          {photographer.specialization?.length
            ? photographer.specialization.join(", ")
            : "Not set"}
        </p>
        <p>
          <b>Location:</b>{" "}
          {photographer.location?.coordinates
            ? `${photographer.location.coordinates[1]}, ${photographer.location.coordinates[0]}`
            : "Not set"}
        </p>
      </div>

      {photographer.services?.length > 0 && (
        <div className="vp-section">
          <h2>Services Offered</h2>
          <div className="vp-services-grid">
            {photographer.services.map((s) => (
              <div key={s._id} className="vp-service-card">
                <h4>{s.serviceName}</h4>
                <p>{s.description}</p>
                <p>
                  <b>Price:</b> ₹{s.priceINR} | <b>Duration:</b>{" "}
                  {s.durationHours} hours
                </p>
                {s.deliverables && (
                  <p>
                    <b>Deliverables:</b> {s.deliverables}
                  </p>
                )}
                <button
                  className="vp-book-btn"
                  onClick={() => handleBookNow(s)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photographer.portfolioImages?.length > 0 && (
        <div className="vp-section">
          <h2>Portfolio Images</h2>
          <div className="vp-portfolio-images">
            {photographer.portfolioImages.map((img, idx) => (
              <img key={idx} src={img} alt={`Portfolio ${idx}`} />
            ))}
          </div>
        </div>
      )}

      {photographer.portfolioVideos?.length > 0 && (
        <div className="vp-section">
          <h2>Portfolio Videos</h2>
          <div className="vp-portfolio-videos">
            {photographer.portfolioVideos.map((vidObj, idx) => {
              const { videoLink, title, description } = vidObj;
              let embedUrl = "";

              if (videoLink.includes("youtube.com/watch?v=")) {
                embedUrl = videoLink.replace("watch?v=", "embed/");
              } else if (videoLink.includes("youtu.be/")) {
                embedUrl = videoLink.replace(
                  "youtu.be/",
                  "www.youtube.com/embed/"
                );
              } else if (videoLink.includes("vimeo.com/")) {
                embedUrl = videoLink.replace(
                  "vimeo.com/",
                  "player.vimeo.com/video/"
                );
              }

              return (
                <div key={idx} className="vp-video-card">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={title || `Video ${idx}`}
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video src={videoLink} controls />
                  )}
                  <h4>{title || "Untitled Video"}</h4>
                  {description && <p>{description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="vp-section"
        style={{ textAlign: "center", marginTop: "2rem" }}
      >
        <button className="vp-reviews-btn" onClick={handleViewReviews}>
          View Reviews & Ratings
        </button>
      </div>
    </div>
  );
};

export default ViewProfile;
