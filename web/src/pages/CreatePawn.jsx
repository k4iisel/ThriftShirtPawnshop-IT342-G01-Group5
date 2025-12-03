import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/CreatePawn.css';

function CreatePawn() {
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    size: '',
    condition: '',
    description: '',
    requestedAmount: '',
    estimatedValue: '',
    images: []
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: files
    }));

    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreview(previewUrls);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.itemName.trim()) {
      notify.notifyError('Item name is required');
      return;
    }
    
    if (!formData.size) {
      notify.notifyError('Size is required');
      return;
    }
    
    if (!formData.condition) {
      notify.notifyError('Condition is required');
      return;
    }
    
    if (!formData.requestedAmount || formData.requestedAmount < 50) {
      notify.notifyError('Requested amount must be at least ₱50');
      return;
    }
    
    if (formData.requestedAmount > 10000) {
      notify.notifyError('Requested amount cannot exceed ₱10,000');
      return;
    }
    
    if (formData.images.length === 0) {
      notify.notifyError('At least one image is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 for storage (or you can handle file upload separately)
      const imagePromises = formData.images.map(file => 
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
      );
      
      const base64Images = await Promise.all(imagePromises);
      
      // Prepare payload for API
      const pawnRequestPayload = {
        itemName: formData.itemName,
        brand: formData.brand || null,
        size: formData.size,
        condition: formData.condition,
        description: formData.description || null,
        requestedAmount: parseFloat(formData.requestedAmount),
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        photos: JSON.stringify(base64Images), // Store as JSON array of base64 strings
        category: 'Thrift Shirt' // Default category
      };

      console.log('🚀 Submitting pawn request payload:', pawnRequestPayload);
      
      // Call API to create pawn request
      const response = await apiService.pawnRequest.create(pawnRequestPayload);
      
      console.log('✅ API response:', response);
      
      if (response.success) {
        notify.notifySuccess('✅ Pawn request submitted successfully! You will be notified once it\'s reviewed.');
        
        // Reset form
        setFormData({
          itemName: '',
          brand: '',
          size: '',
          condition: '',
          description: '',
          requestedAmount: '',
          estimatedValue: '',
          images: []
        });
        setImagePreview([]);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        notify.notifyError(response.message || 'Error submitting pawn request. Please try again.');
      }

    } catch (error) {
      console.error('Error:', error);
      notify.notifyError(error.data?.message || 'Error submitting pawn request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-pawn-page">
      <Navbar />

      <div className="create-pawn-content">
        <Header />

        <div className="create-pawn">
          <div className="page-header">
            <h1>Submit Pawn Request</h1>
            <p>Get cash for your thrift shirts. Fill out the form below to request a pawn.</p>
          </div>

          <form className="pawn-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Item Information</h2>
          
          <div className="form-group">
            <label htmlFor="itemName">Item Name *</label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              placeholder="e.g., Vintage Band T-Shirt, Designer Polo, etc."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Nike, Adidas, Uniqlo, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="size">Size *</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition *</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Condition</option>
              <option value="Like New">Like New - Excellent condition, barely worn</option>
              <option value="Very Good">Very Good - Minor signs of wear</option>
              <option value="Good">Good - Some wear but still in good shape</option>
              <option value="Fair">Fair - Noticeable wear but functional</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the item, any unique features, flaws, or special characteristics..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Images</h2>
          <div className="form-group">
            <label htmlFor="images">Upload Images (Max 5) *</label>
            <input
              ref={fileInputRef}
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              required={imagePreview.length === 0}
            />
            <small>Upload clear photos of your item from different angles</small>
          </div>

          {imagePreview.length > 0 && (
            <div className="image-preview">
              <h3>Image Preview</h3>
              <div className="preview-grid">
                {imagePreview.map((url, index) => (
                  <div key={index} className="preview-item">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Loan Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="requestedAmount">Requested Loan Amount (₱) *</label>
              <input
                type="number"
                id="requestedAmount"
                name="requestedAmount"
                value={formData.requestedAmount}
                onChange={handleInputChange}
                placeholder="500"
                min="50"
                max="10000"
                step="50"
                required
              />
              <small>Minimum: ₱50, Maximum: ₱10,000</small>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedValue">Estimated Item Value (₱)</label>
              <input
                type="number"
                id="estimatedValue"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleInputChange}
                placeholder="1000"
                min="0"
                step="50"
              />
              <small>Your estimated value of the item</small>
            </div>
          </div>
        </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Pawn Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePawn;