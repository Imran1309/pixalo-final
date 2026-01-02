import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PhotographerPortfolio.css";

const PhotographerPortfolio = () => {
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const navigate = useNavigate();

  // Basic portfolio form
  const [form, setForm] = useState({
    introduction: "",
    yearsOfExperience: "",
    typeOfWork: "Photographer",
    specialization: [],
    latitude: "",
    longitude: "",
  });

  // Services form
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    description: "",
    durationHours: "",
    priceINR: "",
    deliverables: "",
  });

  // Availability form
  const [availabilityForm, setAvailabilityForm] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  // Availability Exception
  const [exceptionForm, setExceptionForm] = useState({
    name: "",
    description: "",
    date: "",
  });

  // Booking Lead Time
  const [leadTimeForm, setLeadTimeForm] = useState({
    workshopDays: false,
    vacationDays: false,
    sameDayBookingAllowed: false,
    advanceNotice: "1 Day",
  });

  const handleViewServices = () => {
        navigate(`/services/${userId}`);
 };
  useEffect(() => {
  if (!userId) return;

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/photographers/profile/${userId}`
      );
      setPhotographer(res.data.photographer);

      // Pre-fill form and availability if data exists
      if (res.data.photographer) {
        const p = res.data.photographer;
        setForm((prev) => ({
          ...prev,
          introduction: p.introduction || "",
          yearsOfExperience: p.yearsOfExperience || "",
          typeOfWork: p.typeOfWork || "Photographer",
          specialization: p.specialization || [],
          latitude: p.location?.coordinates
            ? p.location.coordinates[1]
            : "",
          longitude: p.location?.coordinates
            ? p.location.coordinates[0]
            : "",
        }));

        // THIS IS THE IMPORTANT PART:
        setAvailabilityForm(p.availability || availabilityForm);
        setLeadTimeForm(p.bookingLeadTime || leadTimeForm);
      }
    } catch (err) {
      if (err.response?.status === 404) setPhotographer(null);
      else console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [userId]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => {
        alert("Unable to get location. Please allow location access.");
        console.error(error);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
};


  const handleSpecialization = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      specialization: checked
        ? [...prev.specialization, value]
        : prev.specialization.filter((item) => item !== value),
    }));
  };

  const handleAvailability = (day, slot) => {
    setAvailabilityForm((prev) => {
      const daySlots = prev[day];
      return {
        ...prev,
        [day]: daySlots.includes(slot)
          ? daySlots.filter((s) => s !== slot)
          : [...daySlots, slot],
      };
    });
  };

  const handleCreateOrUpdatePortfolio = async () => {
    try {
      const payload = {
        userId,
        ...form,
        latitude: form.latitude,
        longitude: form.longitude,
      };
      const res = await axios.post(
        "http://localhost:5000/api/photographers/profile",
        payload
      );
      setPhotographer(res.data.photographer);
      alert("Portfolio saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save portfolio.");
    }
  };

  const handleAddService = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/photographers/service",
        { userId, service: serviceForm }
      );
      setPhotographer(res.data.photographer);
      alert("Service added successfully!");
      setServiceForm({
        serviceName: "",
        description: "",
        durationHours: "",
        priceINR: "",
        deliverables: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add service.");
    }
  };

  const handleUpdateAvailability = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/photographers/availability",
        { userId, availability: availabilityForm }
      );
      setPhotographer(res.data.photographer);
      alert("Availability updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update availability.");
    }
  };

  const handleAddException = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/photographers/availability/exception",
        { userId, exception: exceptionForm }
      );
      setPhotographer(res.data.photographer);
      alert("Exception added!");
      setExceptionForm({ name: "", description: "", date: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add exception.");
    }
  };

  const handleUpdateLeadTime = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/photographers/booking-leadtime",
        { userId, bookingLeadTime: leadTimeForm }
      );
      setPhotographer(res.data.photographer);
      alert("Booking lead time updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update lead time.");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="portfolio-container">
      {!photographer && (
        <div className="portfolio-form">
          <h2>Create Your Portfolio</h2>
          <input
            type="text"
            name="introduction"
            placeholder="Introduction"
            value={form.introduction}
            onChange={handleChange}
          />
          <input
            type="number"
            name="yearsOfExperience"
            placeholder="Years of Experience"
            value={form.yearsOfExperience}
            onChange={handleChange}
          />
          <select
            name="typeOfWork"
            value={form.typeOfWork}
            onChange={handleChange}
          >
            <option value="Photographer">Photographer</option>
            <option value="Videographer">Videographer</option>
            <option value="Both">Both</option>
          </select>

          <div className="specialization-section">
            <label>Specializations:</label>
            {[
              "Portrait",
              "Fashion",
              "Wedding",
              "Event",
              "Commercial Product",
              "Landscape",
              "Documentary",
              "Aerial/Drone",
            ].map((spec) => (
              <label key={spec}>
                <input
                  type="checkbox"
                  value={spec}
                  onChange={handleSpecialization}
                  checked={form.specialization.includes(spec)}
                />
                {spec}
              </label>
            ))}
          </div>

          <div className="location-section">
                <input
                    type="text"
                    name="latitude"
                    placeholder="Latitude"
                    value={form.latitude}
                    readOnly
                    className="coords-input"
                />
                
                <input
                    type="text"
                    name="longitude"
                    placeholder="Longitude"
                    value={form.longitude}
                    readOnly
                    className="coords-input"
                />
                <button type="button" onClick={getCurrentLocation}>
                    Use My Location
                </button>
          </div>

          <button onClick={handleCreateOrUpdatePortfolio}>
            Create Portfolio
          </button>
        </div>
      )}

      {photographer && (
        <>
          <h1>📸 {photographer.introduction}</h1>
          <p>
            <b>Experience:</b> {photographer.yearsOfExperience} years
          </p>
          <p>
            <b>Type of Work:</b> {photographer.typeOfWork}
          </p>
          <p>
            <b>Specializations:</b>{" "}
            {photographer.specialization.join(", ") || "None"}
          </p>
          <p>
            <b>Location:</b>{" "}
            {photographer.location?.coordinates
              ? `${photographer.location.coordinates[1]}, ${photographer.location.coordinates[0]}`
              : "Not set"}
          </p>

          {/* Services Section */}
          <div className="feature-section">
            <h4>💼 Add Service</h4>
            <input
              type="text"
              placeholder="Service Name"
              value={serviceForm.serviceName}
              onChange={(e) =>
                setServiceForm((prev) => ({
                  ...prev,
                  serviceName: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Description"
              value={serviceForm.description}
              onChange={(e) =>
                setServiceForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <input
              type="number"
              placeholder="Duration Hours"
              value={serviceForm.durationHours}
              onChange={(e) =>
                setServiceForm((prev) => ({
                  ...prev,
                  durationHours: e.target.value,
                }))
              }
            />
            <input
              type="number"
              placeholder="Price INR"
              value={serviceForm.priceINR}
              onChange={(e) =>
                setServiceForm((prev) => ({ ...prev, priceINR: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Deliverables"
              value={serviceForm.deliverables}
              onChange={(e) =>
                setServiceForm((prev) => ({
                  ...prev,
                  deliverables: e.target.value,
                }))
              }
            />
            <button onClick={handleAddService}>Add Service</button>
            <button onClick={handleViewServices}>View My Services</button>

          </div>

          {/* Availability Section */}
          <div className="feature-section">
            <h4>🗓️ Update Availability</h4>
            {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((day) => (
              <div key={day}>
                <b>{day.charAt(0).toUpperCase() + day.slice(1)}:</b>
                {["Morning","Afternoon","Evening"].map((slot) => (
                  <label key={slot}>
                    <input
                      type="checkbox"
                      checked={availabilityForm[day]?.includes(slot)}
                      onChange={() => handleAvailability(day, slot)}
                    />
                    {slot}
                  </label>
                ))}
              </div>
            ))}
            <button onClick={handleUpdateAvailability}>Update Availability</button>
          </div>

          {/* Exceptions Section */}
          <div className="feature-section">
            <h4>🚫 Add Availability Exception</h4>
            <input
              type="text"
              placeholder="Name"
              value={exceptionForm.name}
              onChange={(e) =>
                setExceptionForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Description"
              value={exceptionForm.description}
              onChange={(e) =>
                setExceptionForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <input
              type="date"
              value={exceptionForm.date}
              onChange={(e) =>
                setExceptionForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />
            <button onClick={handleAddException}>Add Exception</button>
          </div>

          {/* Booking Lead Time Section */}
          <div className="feature-section">
            <h4>⏱️ Update Booking Lead Time</h4>
            <label>
              <input
                type="checkbox"
                checked={leadTimeForm.workshopDays}
                onChange={(e) =>
                  setLeadTimeForm((prev) => ({
                    ...prev,
                    workshopDays: e.target.checked,
                  }))
                }
              />
              Workshop Days
            </label>
            <label>
              <input
                type="checkbox"
                checked={leadTimeForm.vacationDays}
                onChange={(e) =>
                  setLeadTimeForm((prev) => ({
                    ...prev,
                    vacationDays: e.target.checked,
                  }))
                }
              />
              Vacation Days
            </label>
            <label>
              <input
                type="checkbox"
                checked={leadTimeForm.sameDayBookingAllowed}
                onChange={(e) =>
                  setLeadTimeForm((prev) => ({
                    ...prev,
                    sameDayBookingAllowed: e.target.checked,
                  }))
                }
              />
              Same Day Booking Allowed
            </label>
            <select
              value={leadTimeForm.advanceNotice}
              onChange={(e) =>
                setLeadTimeForm((prev) => ({
                  ...prev,
                  advanceNotice: e.target.value,
                }))
              }
            >
              {["1 Day","2 Days","3 Days","1 Week"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button onClick={handleUpdateLeadTime}>Update Lead Time</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhotographerPortfolio;
