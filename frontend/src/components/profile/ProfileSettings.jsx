import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Save, User, Mail, Phone, Globe, Lock } from 'lucide-react';

import { setUserData } from '../../slice/auth/authSlice'; // Adjust path if needed
import { toastError, toastSuccess } from '../../services/toastService'; // Adjust path if needed
import Upload from '../uploadImage/Upload'; // Adjust path to your Upload component

// Reusable Form Input Component for consistency and clean code
const FormInput = ({ id, label, value, onChange, error, icon: Icon, disabled, readOnly, placeholder, type = "text" }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
      <input
        id={id}
        name={id}
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={disabled || readOnly}
        className={`w-full py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-colors ${Icon ? 'pl-10' : 'pl-3'} pr-3 ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
      />
      {readOnly && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
    </div>
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

const ProfileSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, userData } = useSelector((state) => state.auth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(userData || {});
  const [errors, setErrors] = useState({});

  // Sync state with Redux store if userData changes
  useEffect(() => {
    if (userData) {
      setProfileData(userData);
    }
  }, [userData]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // This function receives the URL from the Upload component
  const handleProfileImageUpload = (imageUrl) => {
    // Update the profile data state with the new URL
    setProfileData(prev => ({ ...prev, profile_pic_url: imageUrl }));
  };

  // Form submission handler
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the data payload for the API
      const payload = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
        country: profileData.country,
        username: profileData.username,
        profile_pic_url: profileData.profile_pic_url,
        bio: profileData.bio,
      };

      // Make the API call to the standardized backend endpoint
      const result = await axios.put(`/users/me`, payload, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (result.data.success) {
        const updatedUser = result.data.user;
        // Update Redux store and cookies with the new user data
        dispatch(setUserData(updatedUser));
        Cookies.set("userData", JSON.stringify(updatedUser), { expires: 1, secure: true, sameSite: "Strict" });
        toastSuccess("Profile updated successfully!");
      } else {
        throw new Error(result.data.message);
      }
    } catch (error) {
      toastError(error.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [profileData, token, dispatch]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Column: Profile Picture Upload */}
      <div className="lg:col-span-1">
        <Upload 
          onUpload={handleProfileImageUpload} 
          currentImageUrl={profileData?.profile_pic_url}
        />
      </div>

      {/* Right Column: Profile Information Form */}
      <div className="lg:col-span-3">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput id="first_name" label="First Name" value={profileData.first_name} onChange={handleInputChange} error={errors.first_name} disabled={isSubmitting} placeholder="Enter first name" />
              <FormInput id="last_name" label="Last Name" value={profileData.last_name} onChange={handleInputChange} error={errors.last_name} disabled={isSubmitting} placeholder="Enter last name" />
            </div>
            <div className="mt-6">
              <FormInput id="username" label="Username" value={profileData.username} onChange={handleInputChange} error={errors.username} disabled={isSubmitting} placeholder="Enter username" />
            </div>
            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Bio / Professional Summary</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio || ""}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tell clients about yourself, your skills, and your experience..."
              />
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <FormInput id="email" label="Email Address" value={profileData.email} icon={Mail} readOnly={true} placeholder="Your email address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput id="phone_number" label="Phone Number" type="tel" value={profileData.phone_number} onChange={handleInputChange} error={errors.phone_number} icon={Phone} disabled={isSubmitting} placeholder="Enter phone number" />
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select id="country" name="country" value={profileData.country || ""} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={isSubmitting}>
                      <option value="">Select Country</option>
                      <option value="Jordan">Jordan</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
