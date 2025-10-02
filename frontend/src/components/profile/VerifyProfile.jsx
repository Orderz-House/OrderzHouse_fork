import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Briefcase,
  DollarSign,
  Tag,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Save,
  Loader,
  Camera,
  Upload,
  ExternalLink,
  Edit,
  Shield,
} from "lucide-react";

const initialProfileState = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone_number: "",
  country: "",
  username: "",
  profile_pic_url: "",
  bio: "",
};

const initialPortfolioItem = {
  title: "",
  description: "",
  hourly_rate: "",
  work_url: "",
  skills: [],
};

function VerifyProfile() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);

  const [profile, setProfile] = useState(initialProfileState);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [newPortfolioItem, setNewPortfolioItem] = useState(initialPortfolioItem);
  const [missingFields, setMissingFields] = useState([]);
  const [profileErrors, setProfileErrors] = useState({});
  const [portfolioErrors, setPortfolioErrors] = useState({});
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false); // Start as false
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // --- FIX 1: Guard the data fetch ---
  // Only run fetchData if the user is authenticated (has a token and userId).
  useEffect(() => {
    if (token && userId) {
      fetchData();
    } else {
      // If not logged in, stop the loading spinner and do nothing.
      setLoading(false);
    }
  }, [token, userId]); // Dependency on token and userId

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const profileRes = await axios.get("http://localhost:5000/users/getUserdata", config );
      const userData = profileRes.data.user;

      setProfile({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        password: "",
        phone_number: userData.phone_number || "",
        country: userData.country || "",
        username: userData.username || "",
        profile_pic_url: userData.profile_pic_url || "",
        id: userData.id || "",
        bio: userData.bio || "",
      });
      setPreviewUrl(userData.profile_pic_url || "");

      try {
        const portfolioRes = await axios.get(`http://localhost:5000/users/freelances/${userId}/port`, config );
        if (portfolioRes.data.success && portfolioRes.data.portfolios) {
          setPortfolioItems(portfolioRes.data.portfolios);
        } else {
          setPortfolioItems([]);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setPortfolioItems([]);
        } else {
          console.error("Failed to load portfolio:", err);
          showMessage("Error loading portfolio items", "error");
          setPortfolioItems([]);
        }
      }

      setIsVerified(userData.is_verified || false);
    } catch (err) {
      console.error("Error loading profile data:", err);
      showMessage("Error loading profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FIX 2: Improved missing fields calculation ---
  useEffect(() => {
    const requiredProfileFields = {
      first_name: "First Name",
      last_name: "Last Name",
      email: "Email",
      phone_number: "Phone Number",
      country: "Country",
      username: "Username",
      profile_pic_url: "Profile Picture",
    };

    const missingProfile = Object.keys(requiredProfileFields)
      .filter(field => !profile[field])
      .map(field => requiredProfileFields[field]);

    const hasPortfolio = portfolioItems.length > 0;
    const missing = [...missingProfile];
    if (!hasPortfolio) {
      missing.push("Portfolio Item");
    }

    setMissingFields(missing);
    
    // Only show the incomplete banner if the user is logged in and not yet verified.
    if (token && !isVerified) {
        setBannerVisible(missing.length > 0);
    } else {
        setBannerVisible(false);
    }

    const totalFields = Object.keys(requiredProfileFields).length + 1; // +1 for portfolio
    const completedFields = totalFields - missing.length;
    setProgress(Math.round((completedFields / totalFields) * 100));
  }, [profile, portfolioItems, isVerified, token]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    const duration = type === "success" ? 1500 : 5000;
    setTimeout(() => setMessage(""), duration);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showMessage("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size must be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      const form = new FormData();
      form.append("image", file);
      const res = await axios.post(`http://localhost:5000/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      } );
      const url = res.data?.url;
      if (!url) throw new Error("Upload failed to return a URL");

      setProfile((prev) => ({ ...prev, profile_pic_url: url }));
      showMessage("Profile image uploaded successfully", "success");
    } catch (err) {
      console.error("Upload error:", err);
      showMessage(err?.response?.data?.message || "Failed to upload image", "error");
      setPreviewUrl(profile.profile_pic_url);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setNewPortfolioItem((prev) => ({ ...prev, [name]: value }));
    setPortfolioErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSkillsChange = (e) => {
    const { value } = e.target;
    const skillsArray = value.split(",").map((s) => s.trim()).filter((s) => s);
    setNewPortfolioItem((prev) => ({ ...prev, skills: skillsArray }));
    setPortfolioErrors((prev) => ({ ...prev, skills: "" }));
  };

  const validateProfile = () => {
    const errors = {};
    if (!profile.first_name.trim()) errors.first_name = "First name is required";
    if (!profile.last_name.trim()) errors.last_name = "Last name is required";
    if (!profile.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profile.email)) errors.email = "Email is invalid";
    if (!profile.phone_number.trim()) errors.phone_number = "Phone number is required";
    if (!profile.country.trim()) errors.country = "Country is required";
    if (!profile.username.trim()) errors.username = "Username is required";
    if (!profile.profile_pic_url.trim()) errors.profile_pic_url = "Profile picture is required";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePortfolio = () => {
    const errors = {};
    if (!newPortfolioItem.title.trim()) errors.title = "Title is required";
    if (!newPortfolioItem.description.trim()) errors.description = "Description is required";
    if (!newPortfolioItem.hourly_rate) errors.hourly_rate = "Hourly rate is required";
    else if (isNaN(newPortfolioItem.hourly_rate) || newPortfolioItem.hourly_rate <= 0) errors.hourly_rate = "Hourly rate must be a positive number";
    if (!newPortfolioItem.work_url.trim()) errors.work_url = "Work URL is required";
    else if (!isValidUrl(newPortfolioItem.work_url)) errors.work_url = "Please enter a valid URL";
    if (!newPortfolioItem.skills.length) errors.skills = "At least one skill is required";
    setPortfolioErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const saveProfile = async () => {
    if (!validateProfile()) {
      showMessage("Please fix the errors in your profile", "error");
      return;
    }
    try {
      setSaving(true);
      const updateData = { ...profile };
      if (!updateData.password) delete updateData.password;
      
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`http://localhost:5000/users/edit/${profile.id}`, updateData, config );

      showMessage("Profile updated successfully! Redirecting...", "success");

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Error updating profile";
      showMessage(errorMessage, "error");
      setSaving(false);
    }
  };

  const addPortfolioItem = async () => {
    if (!validatePortfolio()) {
      showMessage("Please fix the errors in your portfolio item", "error");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpoint = editingPortfolioId
        ? `http://localhost:5000/users/freelancers/portfolio/edit/${editingPortfolioId}`
        : "http://localhost:5000/users/freelancers/portfolio/create";
      const method = editingPortfolioId ? "put" : "post";
      const res = await axios[method](endpoint, { ...newPortfolioItem, freelancer_id: userId }, config );

      if (res.data.success) {
        if (editingPortfolioId) {
          setPortfolioItems((prev) => prev.map((item) => (item.id === editingPortfolioId ? res.data.portfolio : item)));
        } else {
          setPortfolioItems((prev) => [...prev, res.data.portfolio]);
        }
        setNewPortfolioItem(initialPortfolioItem);
        setShowPortfolioForm(false);
        setEditingPortfolioId(null);
        showMessage(`Portfolio item ${editingPortfolioId ? "updated" : "added"} successfully`, "success");
        setIsVerified(false);
      } else {
        showMessage("Failed to save portfolio item", "error");
      }
    } catch (error) {
      console.error("Error saving portfolio item:", error);
      showMessage(error.response?.data?.message || "Error saving portfolio item", "error");
    }
  };

  const editPortfolioItem = (item) => {
    setNewPortfolioItem({
      title: item.title || "",
      description: item.description || "",
      hourly_rate: item.hourly_rate || "",
      work_url: item.work_url || "",
      skills: item.skills || [],
    });
    setEditingPortfolioId(item.id);
    setShowPortfolioForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setNewPortfolioItem(initialPortfolioItem);
    setEditingPortfolioId(null);
    setShowPortfolioForm(false);
  };

  const removePortfolioItem = async (portfolioId) => {
    if (!window.confirm("Are you sure you want to remove this portfolio item?")) return;
    try {
      const res = await axios.delete("http://localhost:5000/users/freelancers/portfolio/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { freelancerId: userId, portfolioId },
      } );
      if (res.data.success) {
        setPortfolioItems((prev) => prev.filter((item) => item.id !== portfolioId));
        showMessage("Portfolio item removed", "success");
        setIsVerified(false);
      }
    } catch (error) {
      console.error("Error removing portfolio item:", error);
      showMessage(error.response?.data?.message || "Error removing portfolio item", "error");
    }
  };

  // Render a loading state
  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
    );
  }

  // Render a message for non-logged-in users
  if (!token) {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
            <p className="text-gray-600 mt-2">Please log in to verify your profile.</p>
            <button onClick={() => navigate('/login')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Go to Login
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Shield className="w-8 h-8 mr-2 text-blue-600" />
            Profile Verification
          </h1>
          <p className="text-gray-600">Complete your profile to start working as a freelancer</p>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5 max-w-md mx-auto">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Complete {progress === 100 && "🎉"}</p>
        </div>

        {bannerVisible && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Profile Incomplete</h3>
                {/* --- FIX 3: More user-friendly message --- */}
                <p className="text-yellow-700">
                  Please complete all required fields to get verified. You still need to complete {missingFields.length} item{missingFields.length === 1 ? '' : 's'}.
                </p>
                {missingFields.length > 0 && (
                  <ul className="mt-2 text-sm text-yellow-600 grid grid-cols-2 gap-1">
                    {missingFields.map((field) => (<li key={field} className="flex items-center">• {field}</li>))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
            <div className="flex items-center">
              {messageType === "success" ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
              {message}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { label: "First Name", name: "first_name", type: "text", icon: User, required: true },
              { label: "Last Name", name: "last_name", type: "text", icon: User, required: true },
              { label: "Email", name: "email", type: "email", icon: Mail, required: true, disabled: true },
              { label: "Phone Number", name: "phone_number", type: "tel", icon: Phone, required: true },
              { label: "Country", name: "country", type: "text", icon: MapPin, required: true },
              { label: "Username", name: "username", type: "text", icon: User, required: true },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={field.type} name={field.name} value={profile[field.name]} onChange={handleProfileChange} disabled={field.disabled} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileErrors[field.name] ? "border-red-300" : "border-gray-300"} ${field.disabled ? "bg-gray-50" : ""}`} placeholder={`Enter your ${field.label.toLowerCase()}`} />
                </div>
                {profileErrors[field.name] && <p className="mt-1 text-sm text-red-600">{profileErrors[field.name]}</p>}
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tell clients about yourself, your skills, and experience..."></textarea>
              <p className="text-xs text-gray-500 mt-1">This will help clients learn more about you</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture <span className="text-red-500">*</span></label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
                    {uploadingImage ? <Loader className="w-5 h-5 text-blue-600 animate-spin" /> : <Camera className="w-5 h-5 text-gray-600" />}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploadingImage} ref={fileInputRef} />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Upload a professional profile picture</p>
                  <label onClick={() => fileInputRef.current && fileInputRef.current.click()} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingImage ? "Uploading..." : "Choose Image"}
                  </label>
                </div>
              </div>
              {profileErrors.profile_pic_url && <p className="mt-1 text-sm text-red-600">{profileErrors.profile_pic_url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
              <input type="password" name="password" value={profile.password} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter new password" />
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors">
            {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center"><Briefcase className="w-5 h-5 mr-2" />Portfolio Items</h2>
            <button onClick={() => { setShowPortfolioForm(!showPortfolioForm); if (showPortfolioForm) cancelEdit(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-1" />
              {showPortfolioForm ? "Cancel" : "Add Item"}
            </button>
          </div>
          {showPortfolioForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingPortfolioId ? "Edit Portfolio Item" : "Add New Portfolio Item"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={newPortfolioItem.title} onChange={handlePortfolioChange} className={`w-full pl-3 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${portfolioErrors.title ? "border-red-300" : "border-gray-300"}`} placeholder="Enter title" />
                  {portfolioErrors.title && <p className="mt-1 text-sm text-red-600">{portfolioErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" name="hourly_rate" value={newPortfolioItem.hourly_rate} onChange={handlePortfolioChange} min={1} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${portfolioErrors.hourly_rate ? "border-red-300" : "border-gray-300"}`} placeholder="Enter hourly rate" />
                  </div>
                  {portfolioErrors.hourly_rate && <p className="mt-1 text-sm text-red-600">{portfolioErrors.hourly_rate}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea name="description" value={newPortfolioItem.description} onChange={handlePortfolioChange} rows={3} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${portfolioErrors.description ? "border-red-300" : "border-gray-300"}`} placeholder="Describe your project or work"></textarea>
                {portfolioErrors.description && <p className="mt-1 text-sm text-red-600">{portfolioErrors.description}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Work URL <span className="text-red-500">*</span></label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="url" name="work_url" value={newPortfolioItem.work_url} onChange={handlePortfolioChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${portfolioErrors.work_url ? "border-red-300" : "border-gray-300"}`} placeholder="https://example.com/project" />
                </div>
                {portfolioErrors.work_url && <p className="mt-1 text-sm text-red-600">{portfolioErrors.work_url}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills <span className="text-red-500">*</span> (comma separated )</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={newPortfolioItem.skills.join(", ")} onChange={handleSkillsChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${portfolioErrors.skills ? "border-red-300" : "border-gray-300"}`} placeholder="React, Node.js, Design, etc." />
                </div>
                {portfolioErrors.skills && <p className="mt-1 text-sm text-red-600">{portfolioErrors.skills}</p>}
                <p className="text-xs text-gray-500 mt-1">Add relevant skills separated by commas</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={addPortfolioItem} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{editingPortfolioId ? "Update" : "Add to"} Portfolio</button>
                {editingPortfolioId && <button onClick={cancelEdit} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>}
              </div>
            </div>
          )}

          {portfolioItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No portfolio items yet. Add your first project to showcase your skills!</p>
              <button onClick={() => setShowPortfolioForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"><Plus className="w-4 h-4 mr-1" />Add Your First Project</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {portfolioItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-lg text-gray-900">{item.title}</h4>
                    <div className="flex space-x-2">
                      <button onClick={() => editPortfolioItem(item)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit item"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => removePortfolioItem(item.id)} className="text-red-500 hover:text-red-700 p-1" title="Remove item"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  {item.skills && item.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.skills.map((skill, index) => (<span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{skill}</span>))}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-semibold">${item.hourly_rate}/hr</span>
                    {item.work_url && (
                      <a href={item.work_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Project
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isVerified && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Profile Verified!</h3>
            <p className="text-green-700">Your profile is complete and you can now accept projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyProfile;
