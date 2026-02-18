import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Upload, Lightbulb } from "lucide-react"; 
import "./PortfolioMedia.css";
import "./PhotographerPortfolio.css"; // Reuse header styles

const PortfolioMedia = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Mock data for images to match screenshot
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1555663731-893bd57d9f75?auto=format&fit=crop&w=300&q=80", // Parrot
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80", // Wedding
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=300&q=80", // Child
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80", // Fashion
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80"  // Portrait
  ]);

  const [videos, setVideos] = useState([1, 2, 3]); // Just 3 placeholders

  // Placeholder state for file input ref
  const fileInputRef = React.useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Create local object URLs for preview
      const newImages = files.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleAddVideo = () => {
    setVideos(prev => [...prev, prev.length + 1]);
  };

  const handleContinue = () => {
      // Navigate to services page
      navigate("/portfolio/services");
  };

  return (
    <div className="portfolio-media-page">
      {/* Header */}
      <div className="portfolio-header">
         <div className="header-left">
            <img src={logo} alt="Pixlo" className="header-logo" />
            <h2>Portfolio Upload</h2>
         </div>
         <div className="header-right">
             <div className="user-avatar-small">
                 <img src={user?.profilePic || defaultProfile} alt="Profile" />
             </div>
         </div>
      </div>

      <div className="media-content">
          
          {/* Upload Section */}
          <h3 className="media-section-title">Upload your work</h3>
          <p className="media-section-subtitle">Upload high quality images that best represent your style and skills</p>
          
          <div className="upload-box">
              <Upload className="upload-icon" />
              <div className="upload-text">Drag and drop your images here</div>
              <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  onChange={handleFileChange}
              />
              <button className="browse-btn" onClick={handleBrowseClick}>Browse files</button>
          </div>

          {/* Images Grid */}
          <div className="images-grid">
              {images.map((img, idx) => (
                  <div className="image-card" key={idx}>
                      <img src={img} alt="Portfolio" />
                  </div>
              ))}
          </div>

          <div className="add-more-btn-container">
              <button className="gold-btn" onClick={handleBrowseClick}>Add More Pictures</button>
          </div>

          {/* Videos Section */}
          <h3 className="media-section-title">Videos</h3>
          <p className="media-section-subtitle">Add links to your videos hosted on youtube or anywhere to showcase your videography skills</p>

          <div className="video-grid">
              {videos.map((v, i) => (
                  <div className="video-card" key={i}>
                      <div className="input-group">
                          <label>Video Link</label>
                          <input type="text" placeholder="Placeholder" className="dark-input" />
                      </div>
                      <div className="input-group">
                          <label>Video Title</label>
                          <input type="text" placeholder="Wedding Reel" className="dark-input" />
                      </div>
                      <div className="input-group">
                          <label>Description(optional)</label>
                          <div className="desc-box">
                              <div className="desc-toolbar">
                                  <span>Roboto</span> <span>Paragraph</span>
                              </div>
                              <textarea placeholder="Your text goes here" className="desc-input"></textarea>
                          </div>
                      </div>
                      <div className="card-footer">
                          <button className="mini-upload-btn">Upload</button>
                      </div>
                  </div>
              ))}
          </div>

          <div className="add-more-btn-container">
              <button className="gold-btn" onClick={handleAddVideo}>Add More Videos</button>
          </div>

          {/* Tips Section */}
          <div className="tips-section">
              <div className="tips-header">
                  <Lightbulb color="#FFD700" size={24} fill="#FFD700" />
                  <h4>Tips for a Great Portfolio</h4>
              </div>
              <ul className="tips-list">
                  <li>Upload 5-10 of your best and most recent work samples</li>
                  <li>Include a variety of styles to showcase your versatility</li>
                  <li>Make sure your images are high resolution and properly exposed</li>
                  <li>Add descriptive captions to provide context for your work</li>
                  <li>For videos, choose short clips (2-3 minutes) that highlight your skills</li>
              </ul>
          </div>

          {/* Footer */}
          <div className="media-footer">
              <button className="btn-back" onClick={() => navigate('/portfolio')}>Back</button>
              <button className="btn-continue" onClick={handleContinue}>Continue</button>
          </div>

      </div>
    </div>
  );
};

export default PortfolioMedia;
