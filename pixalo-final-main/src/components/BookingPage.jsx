import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BookingPage.css";


const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

const BookingPage = () => {
  const { photographerId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const service = location.state?.service;
  const photographer = location.state?.photographer;

  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?._id;

  const [formData, setFormData] = useState({
    eventDate: "",
    eventTime: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");

  const API_URL = import.meta.env.VITE_API_URL; // ✅ backend url from env

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
          );
          if (res.data.results && res.data.results.length > 0) {
            const components = res.data.results[0].components;
            const cityName =
              components.city ||
              components.town ||
              components.village ||
              components.state ||
              "";
            setCity(cityName);
            setFormData((prev) => ({ ...prev, location: cityName }));
          } else {
            alert("Unable to fetch address. Please try again.");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          alert("Unable to fetch address. Please try again.");
        }
      },
      (err) => {
        console.error(err);
        alert("Unable to access location. Please enable GPS.");
      }
    );
  };

  const handleRazorpayPayment = (order, booking) => {
    if (!order || !window.Razorpay) {
      alert("Unable to initiate payment.");
      return;
    }

    const options = {
      key: "rzp_test_Qi1InUYyVMLZdY",
      amount: order.amount,
      currency: order.currency,
      name: "Pixlo",
      description: `Booking for ${service?.serviceName}`,
      order_id: order.id,
      handler: async function (response) {
        try {
          const verifyRes = await axios.post(
            `${API_URL}/api/bookings/verify-payment`,   // ✅ updated
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            }
          );

          if (verifyRes.data.success) {
            alert("✅ Payment successful!");
            navigate(`/my-bookings`);
          } else {
            alert("Payment verification failed.");
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          alert("Payment verification failed.");
        }
      },
      prefill: {
        name: user?.name || "Customer",
        email: user?.email || "test@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!customerId) {
      alert("Please log in before booking.");
      setLoading(false);
      return;
    }

    try {
      console.log("Creating booking with:", {
        customerId,
        photographerId,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        durationHours: service?.durationHours,
        location: formData.location,
        amount: service?.priceINR,
      });

      const res = await axios.post(`${API_URL}/api/bookings`, {   // ✅ updated
        customerId,
        photographerId,
        serviceId,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        durationHours: service?.durationHours,
        location: formData.location,
        amount: service?.priceINR,
      });

      console.log("Booking API Response:", res.data);

      if (res.data.success) {
        alert("✅ Booking created successfully!");
        const { order, booking } = res.data;

        if (order) {
          handleRazorpayPayment(order, booking);
        } else {
          alert("Razorpay order not generated.");
          navigate(`/photographer/${photographerId}`);
        }
      } else {
        alert(res.data.message || "Booking failed.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Something went wrong while creating booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <h1>Book {service?.serviceName}</h1>
      <p>
        <b>Price:</b> ₹{service?.priceINR} | <b>Duration:</b>{" "}
        {service?.durationHours} hours
      </p>

      <form onSubmit={handleBooking} className="booking-form">
        <label>Event Date:</label>
        <input
          type="date"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          required
        />

        <label>Event Time:</label>
        <input
          type="time"
          name="eventTime"
          value={formData.eventTime}
          onChange={handleChange}
          required
        />

        <label>Event Location:</label>
        <input
          type="text"
          name="location"
          placeholder="Enter event location or use your current location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <button
          type="button"
          className="use-location-btn"
          onClick={handleUseMyLocation}
        >
          📍 Use My Location
        </button>

        {city && (
          <p className="city-info">
            <b>Detected City:</b> {city}
          </p>
        )}

        <button type="submit" className="confirm-btn" disabled={loading}>
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
