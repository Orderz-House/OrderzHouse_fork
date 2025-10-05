import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User } from 'lucide-react';

function EditProfile() {
  const { userData } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    country: '',
    profile_pic_url: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login.' });
        setFetchLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/users/getUserdata', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData = {
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          username: data.user.username || '',
          email: data.user.email || '',
          phone_number: data.user.phone_number || '',
          country: data.user.country || '',
          profile_pic_url: data.user.profile_pic_url || ''
        };
        setFormData(userData);
        setOriginalData(userData);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading profile' });
      console.error('Error:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.first_name !== originalData.first_name ||
      formData.last_name !== originalData.last_name ||
      formData.username !== originalData.username ||
      formData.phone_number !== originalData.phone_number ||
      formData.country !== originalData.country ||
      formData.profile_pic_url !== originalData.profile_pic_url
    );
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    if (name === 'first_name' || name === 'last_name' || name === 'username' || name === 'country') {
      if (!value || value.trim() === '') {
        errors[name] = 'This field is required';
      } else {
        delete errors[name];
      }
    }

    if (name === 'phone_number') {
      if (!value || value.trim() === '') {
        errors[name] = 'Phone number is required';
      } else if (!/^\d{10}$/.test(value)) {
        errors[name] = 'Phone number must be exactly 10 digits with no letters';
      } else {
        delete errors[name];
      }
    }

    setValidationErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone_number') {
      // Only allow digits and limit to 10
      const digitsOnly = value.replace(/\D/g, '');
      const limitedValue = digitsOnly.slice(0, 10);
      setFormData({
        ...formData,
        [name]: limitedValue
      });
      validateField(name, limitedValue);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      validateField(name, value);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name || formData.first_name.trim() === '') {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name || formData.last_name.trim() === '') {
      errors.last_name = 'Last name is required';
    }
    if (!formData.username || formData.username.trim() === '') {
      errors.username = 'Username is required';
    }
    if (!formData.phone_number || formData.phone_number.trim() === '') {
      errors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      errors.phone_number = 'Phone number must be exactly 10 digits';
    }
    if (!formData.country || formData.country.trim() === '') {
      errors.country = 'Country is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (!hasChanges()) {
      setMessage({ type: 'error', text: 'No changes to save' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login.' });
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/users/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          phone_number: formData.phone_number,
          country: formData.country,
          profile_pic_url: formData.profile_pic_url
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setOriginalData(formData);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error connecting to server' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028090] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isButtonDisabled = !hasChanges() || loading || Object.keys(validationErrors).length > 0;

  return (
    <div className="w-full">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>

      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-[#028090]">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Edit Profile</h1>
        <p className="text-white text-opacity-80 text-xs sm:text-sm mt-1">
          Update your personal information
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-br from-[#028090] to-[#016d7a] rounded-full flex items-center justify-center">
              {formData.profile_pic_url ? (
                <img 
                  src={formData.profile_pic_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-white" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[#028090] rounded-full flex items-center justify-center text-white hover:bg-[#016d7a] transition-colors shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-6 sm:gap-y-8 mb-8 sm:mb-12">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="OrderzHouse"
              className={`w-full px-0 py-3 bg-transparent border-b-2 ${
                validationErrors.first_name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-[#028090] transition-colors text-gray-600 placeholder-gray-400`}
            />
            {validationErrors.first_name && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="User"
              className={`w-full px-0 py-3 bg-transparent border-b-2 ${
                validationErrors.last_name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-[#028090] transition-colors text-gray-600 placeholder-gray-400`}
            />
            {validationErrors.last_name && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.last_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="orderzhouse_user"
              className={`w-full px-0 py-3 bg-transparent border-b-2 ${
                validationErrors.username ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-[#028090] transition-colors text-gray-600 placeholder-gray-400`}
            />
            {validationErrors.username && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              placeholder="orderzhouse@gmail.com"
              className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-300 text-gray-400 cursor-not-allowed placeholder-gray-400"
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="0791234567"
              className={`w-full px-0 py-3 bg-transparent border-b-2 ${
                validationErrors.phone_number ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-[#028090] transition-colors text-gray-600 placeholder-gray-400`}
            />
            {validationErrors.phone_number && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.phone_number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Jordan"
              className={`w-full px-0 py-3 bg-transparent border-b-2 ${
                validationErrors.country ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-[#028090] transition-colors text-gray-600 placeholder-gray-400`}
            />
            {validationErrors.country && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.country}</p>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-lg border animate-slide-down ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end mb-8">
          <button
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className={`px-10 py-3 rounded-lg font-medium shadow-md transition-colors ${
              isButtonDisabled
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#028090] text-white hover:bg-[#016d7a]'
            }`}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;