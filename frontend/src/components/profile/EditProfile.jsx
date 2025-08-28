import { useState, useEffect } from "react";
import {
    Save,
    Upload,
    Eye,
    EyeOff,
    User,
    Mail,
    Phone,
    Globe,
    Camera,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Settings,
    Briefcase,
    FileText,
    CreditCard,
    UserCog,
    Lock
} from "lucide-react";
import Cookies from "js-cookie"
import axios from "axios";
import EditPortfolio from "./EditPortfolio";

import Identity from "./Identity";
import Billing from "./Billing";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


const EditProfile = () => {
     const navigate = useNavigate();
    const { token , userData} = useSelector((state) => state.auth);
    
    useEffect(() => {
      if (!token) {
        navigate("/login"); // لو ما في توكن يرجعه ع صفحة تسجيل الدخول
      }
    }, [token, navigate]);
    const [activeSection, setActiveSection] = useState("profile");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState("");

    const [profileData, setProfileData] = useState(userData);
  const [online, setOnline] = useState(profileData?.is_online ?? false);

  useEffect(() => {
    if (profileData) {
      setOnline(profileData.is_online);
    }
  }, [profileData]);

    const navigationItems = [
        {
            id: "profile",
            label: "Profile Settings",
            icon: Settings,
            active: true
        },
        {
            id: "portfolio",
            label: "Manage Portfolio",
            icon: Briefcase,
            active: false
        },
        {
            id: "identity",
            label: "Identity Information",
            icon: FileText,
            active: false
        },
        {
            id: "billing",
            label: "Billing Information",
            icon: CreditCard,
            active: false
        },
        {
            id: "account",
            label: "Account Settings",
            icon: UserCog,
            active: false
        }
    ];

    

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
        
        if (saveSuccess) {
            setSaveSuccess(false);
        }
        
        if (saveError) {
            setSaveError("");
        }

        
        
    };

    const validateForm = () => {
        const newErrors = {};

        if (!profileData.first_name.trim()) {
            newErrors.first_name = "First name is required";
        } else if (profileData.first_name.length < 2) {
            newErrors.first_name = "First name must be at least 2 characters";
        }

        if (!profileData.last_name.trim()) {
            newErrors.last_name = "Last name is required";
        } else if (profileData.last_name.length < 2) {
            newErrors.last_name = "Last name must be at least 2 characters";
        }

        if (!profileData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!profileData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (profileData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
            newErrors.username = "Username can only contain letters, numbers, and underscores";
        }

        if (!profileData.phone_number.trim()) {
            newErrors.phone_number = "Phone number is required";
        } else if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(profileData.phone_number)) {
            newErrors.phone_number = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
            return;
        }
        
        setIsSubmitting(true);
        setSaveError("");
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log("Saving profile data:", profileData);
            
            axios.put(`http://localhost:5000/users/update/${profileData.id}`, {
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                phone_number: profileData.phone_number,
                country: profileData.country,
                username: profileData.username
            },{
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((result)=>{
                console.log(result);
                setSaveSuccess(true);
                setProfileData(result.data.user);
                Cookies.set("userData", JSON.stringify(result.data.user), {expires : 1, secure: true, sameSite: "Strict"})
            }).catch((err)=>{
                console.log(err);
                
            })
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            setSaveError("Failed to save profile. Please try again.");
            console.error("Save error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setSaveError("Please select an image file");
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                setSaveError("Image size must be less than 5MB");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileData(prev => ({
                    ...prev,
                    profile_pic_url: e.target.result
                }));
            };
            reader.onerror = () => {
                setSaveError("Failed to load image. Please try another file.");
            };
            reader.readAsDataURL(file);
        }
    };

    /*
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
*/
    const renderProfileSection = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Picture & Status */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Picture Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                                    {profileData?.profile_pic_url ? (
                                        <img
                                            src={profileData?.profile_pic_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <label 
                                    htmlFor="profile-upload" 
                                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-lg p-1.5 cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Camera className="w-3 h-3" />
                                </label>
                                <input
                                    id="profile-upload"
                                    name="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            
                            <button
                                onClick={() => document.getElementById('profile-upload').click()}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                disabled={isSubmitting}
                            >
                                Change Photo
                            </button>
                            
                            <p className="text-xs text-gray-500 mt-2">
                                JPG, PNG or GIF. Max 5MB.
                            </p>
                        </div>
                    </div>

                    {/* Account Status Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Status</span>
                                <div className="flex items-center space-x-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <span className={`font-medium ${online ? 'text-green-700' : 'text-gray-600'}`}>
                                        {online ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Joined</span>
                                <span className="text-gray-900 font-medium">
                                    {new Date(profileData?.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Account</span>
                                <span className={`font-medium ${profileData?.is_deleted ? 'text-red-600' : 'text-green-600'}`}>
                                    {profileData?.is_deleted ? 'Suspended' : 'Active'}
                                </span>
                            </div>
                            
                            {profileData?.violation_count > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Violations</span>
                                    <div className="flex items-center space-x-1">
                                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                                        <span className="text-amber-700 font-medium">{profileData?.violation_count}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        value={profileData?.first_name}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.first_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter first name"
                                        disabled={isSubmitting}
                                    />
                                    {errors.first_name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        value={profileData?.last_name}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.last_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter last name"
                                        disabled={isSubmitting}
                                    />
                                    {errors.last_name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={profileData?.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        errors.username ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter username"
                                    disabled={isSubmitting}
                                />
                                {errors.username && (
                                    <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={profileData?.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            disabled={true}
                                            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-400 ${
                                                errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter email address"
                                            //disabled={isSubmitting}
                                            //readOnly={true}
                                        />
                                        <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input
                                                id="phone_number"
                                                name="phone_number"
                                                type="tel"
                                                value={profileData?.phone_number}
                                                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.phone_number ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Enter phone number"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        {errors.phone_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                            Country
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <select
                                                id="country"
                                                name="country"
                                                value={profileData?.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                <option value="United States">United States</option>
                                                <option value="Canada">Canada</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Germany">Germany</option>
                                                <option value="France">France</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Jordan">Jordan</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security 
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Security</h2>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        // value={profileData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Leave empty to keep current password"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Leave empty to keep your current password
                                </p>
                            </div>
                        </div>
                        */}
                        {/* Reason for Disruption - Only show if exists */}
                        {profileData?.reason_for_disruption && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    Account Issues
                                </h2>
                                
                                <div>
                                    <label htmlFor="reason_for_disruption" className="block text-sm font-medium text-red-700 mb-2">
                                        Reason for Disruption
                                    </label>
                                    <textarea
                                        id="reason_for_disruption"
                                        name="reason_for_disruption"
                                        value={profileData?.reason_for_disruption}
                                        className="w-full px-3 py-2.5 border border-red-300 rounded-lg bg-red-50 text-red-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        rows="3"
                                        readOnly
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Technical Information */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Socket ID</span>
                                    <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                                        {profileData?.socket_id}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Account Status</span>
                                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                                        profileData?.is_deleted 
                                            ? 'bg-red-100 text-red-700' 
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {profileData?.is_deleted ? 'Suspended' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
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

    const renderAccountSection = () => {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                <div className="text-center py-12">
                    <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Account settings features coming soon.</p>
                    <p className="text-sm text-gray-500 mt-2">Manage privacy settings, notifications, and account preferences.</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={isSubmitting}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                                <p className="text-sm text-gray-600">Update your personal information</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${profileData?.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">
                                    {profileData?.is_online ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Status Messages */}
                {saveSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                        <span className="font-medium">Profile updated successfully!</span>
                    </div>
                )}
                
                {saveError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center">
                        <XCircle className="w-5 h-5 mr-3 text-red-600" />
                        <span className="font-medium">{saveError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                            <nav className="space-y-1">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeSection === item.id;
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                            disabled={isSubmitting}
                                        >
                                            <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-4">
                        {activeSection === "profile" && renderProfileSection()}
                        {activeSection === "portfolio" && <EditPortfolio/>}
                        {activeSection === "identity" && <Identity/>}
                        {activeSection === "billing" && <Billing/>}
                        {activeSection === "account" && renderAccountSection()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
