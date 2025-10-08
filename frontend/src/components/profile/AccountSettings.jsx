import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { 
  Shield, 
  QrCode, 
  KeyRound, 
  Loader, 
  AlertTriangle, 
  Lock, 
  Eye, 
  EyeOff,
  UserX,
  LogOut,
  Calendar
} from 'lucide-react';

const AccountSettings = () => {
  const { token, userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('2fa');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Deactivation states
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [showDeactivatePassword, setShowDeactivatePassword] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);

  // Button escape effect states
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isButtonEscaping, setIsButtonEscaping] = useState(false);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  const is2faEnabled = userData?.is_two_factor_enabled || false;

  // Check if deactivation requirements are met
  const isDeactivationReady = deactivateConfirm && deactivatePassword;

  // Button escape effect - Reset to center when requirements are met
  useEffect(() => {
    if (isDeactivationReady) {
      // Return to center position when requirements are met
      setButtonPosition({ x: 0, y: 0 });
      setIsButtonEscaping(false);
    } else {
      setIsButtonEscaping(true);
    }
  }, [isDeactivationReady]);

  const handleMouseMove = (e) => {
    // Only escape if requirements are NOT met
    if (!isButtonEscaping || !buttonRef.current || !containerRef.current || isDeactivationReady) return;

    const button = buttonRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    const buttonRect = button.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const distance = Math.sqrt(
      Math.pow(mouseX - buttonCenterX, 2) + Math.pow(mouseY - buttonCenterY, 2)
    );
    
    // If mouse is too close to the button, move it away
    if (distance < 100) {
      const angle = Math.atan2(mouseY - buttonCenterY, mouseX - buttonCenterX);
      const escapeDistance = 120;
      
      const newX = -Math.cos(angle) * escapeDistance;
      const newY = -Math.sin(angle) * escapeDistance;
      
      // Keep button within container bounds
      const maxX = containerRect.width - buttonRect.width - 20;
      const maxY = containerRect.height - buttonRect.height - 20;
      
      setButtonPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  };

  // Reset button position when tab changes
  useEffect(() => {
    setButtonPosition({ x: 0, y: 0 });
    setIsButtonEscaping(false);
  }, [activeTab]);

  const handleGenerateSecret = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/2fa/generate', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQrCodeUrl(response.data.qrCodeUrl);
      setSuccess('Scan the QR code with your authenticator app.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate 2FA secret.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/2fa/verify', { token: verificationCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(response.data.message);
      setQrCodeUrl('');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!currentPassword) {
      setError('Please enter your current password to disable 2FA.');
      return;
    }

    if (!window.confirm("Are you sure you want to disable 2FA? This will reduce your account's security.")) return;
    
    setIsLoading(true);
    setError('');
    try {
      const verifyResponse = await axios.post('/api/users/verify-password', {
        password: currentPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!verifyResponse.data.success) {
        setError('Incorrect password. Please try again.');
        return;
      }

      await axios.post('http://localhost:5000/api/auth/2fa/disable', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess("2FA has been successfully disabled.");
      setCurrentPassword('');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await axios.put('/api/users/update-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivateConfirm) {
      setError('Please confirm you understand the consequences of deactivating your account.');
      return;
    }

    if (!deactivatePassword) {
      setError('Please enter your password to deactivate your account.');
      return;
    }

    if (!window.confirm("This will deactivate your account. You have 30 days to reactivate by logging in. After 30 days, your account will be permanently deleted. Are you sure?")) return;

    setIsLoading(true);
    setError('');
    try {
      const verifyResponse = await axios.post('/api/users/verify-password', {
        password: deactivatePassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!verifyResponse.data.success) {
        setError('Incorrect password. Please try again.');
        return;
      }

      const response = await axios.put('/api/users/deactivate', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Account deactivated successfully. You have 30 days to reactivate by logging in.');
      
      setTimeout(() => {
        dispatch({ type: 'auth/logout' });
        window.location.href = '/login';
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeactivatePassword('');
    setDeactivateConfirm(false);
    setError('');
    setSuccess('');
    setButtonPosition({ x: 0, y: 0 });
    setIsButtonEscaping(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Shield className="w-6 h-6 mr-3 text-blue-600" />
        Account Security Settings
      </h2>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => { setActiveTab('2fa'); resetForms(); }}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === '2fa' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Two-Factor Auth
        </button>
        <button
          onClick={() => { setActiveTab('password'); resetForms(); }}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'password' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => { setActiveTab('deactivate'); resetForms(); }}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'deactivate' 
              ? 'border-red-500 text-red-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Deactivate Account
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
          <AlertTriangle size={16} className="mr-2 flex-shrink-0" /> 
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && (
        <div>
          <p className="text-gray-600 mb-6">
            Add an extra layer of security to your account by requiring a one-time code from your authenticator app during login.
          </p>

          {is2faEnabled ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="font-bold text-green-800 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                2FA is Active
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Your account is protected with two-factor authentication.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password (required to disable 2FA)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="pl-10 pr-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleDisable2FA}
                  disabled={isLoading || !currentPassword}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300"
                >
                  {isLoading ? <Loader className="animate-spin mr-2" /> : <Shield className="mr-2" />}
                  Disable 2FA
                </button>
              </div>
            </div>
          ) : (
            <div>
              {!qrCodeUrl ? (
                <button
                  onClick={handleGenerateSecret}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-all duration-300"
                >
                  {isLoading ? <Loader className="animate-spin mr-2" /> : <Shield size={16} className="mr-2" />}
                  Enable 2FA
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Step 1: Scan QR Code</h3>
                    <p className="text-sm text-gray-600">Use an authenticator app (like Google Authenticator, Authy, or 1Password) to scan this QR code.</p>
                    <div className="mt-2 p-4 bg-gray-100 inline-block rounded-lg">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">Step 2: Verify Code</h3>
                    <p className="text-sm text-gray-600">Enter the 6-digit code from your authenticator app to complete the setup.</p>
                    <div className="flex items-center mt-2 gap-3">
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          maxLength="6"
                          className="w-40 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
                          disabled={isLoading}
                        />
                      </div>
                      <button
                        onClick={handleVerifyToken}
                        disabled={isLoading || verificationCode.length !== 6}
                        className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {isLoading ? <Loader className="animate-spin" /> : 'Verify & Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Update your password to keep your account secure.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="pl-10 pr-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pl-10 pr-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pl-10 pr-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300"
          >
            {isLoading ? <Loader className="animate-spin mr-2" /> : <Lock className="mr-2" />}
            Update Password
          </button>
        </div>
      )}

      {/* Deactivate Account Tab */}
      {activeTab === 'deactivate' && (
        <div 
          className="space-y-4 relative min-h-[400px]"
          ref={containerRef}
          onMouseMove={handleMouseMove}
        >
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h3 className="font-bold text-red-800 flex items-center">
              <UserX className="w-5 h-5 mr-2" />
              Account Deactivation Warning
            </h3>
            <p className="text-red-700 text-sm mb-2">
              <strong>Important:</strong> Deactivating your account will:
            </p>
            <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
              <li>Immediately log you out and disable your account</li>
              <li>Hide your profile and all associated data</li>
              <li>Give you 30 days to reactivate by simply logging in</li>
              <li><strong>Permanently delete your account after 30 days</strong></li>
            </ul>
          </div>

          <div className="flex items-start space-x-2 p-4 bg-yellow-50 rounded-lg">
            <Calendar className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 text-sm font-medium">30-Day Grace Period</p>
              <p className="text-yellow-700 text-xs">
                You can reactivate your account anytime within 30 days by logging in. After 30 days, your account and all data will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="deactivate-confirm"
                checked={deactivateConfirm}
                onChange={(e) => setDeactivateConfirm(e.target.checked)}
                className="mt-1 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="deactivate-confirm" className="text-sm text-gray-700">
                I understand that my account will be deactivated immediately and permanently deleted after 30 days if I don't log in to reactivate it.
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Password to Confirm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showDeactivatePassword ? "text" : "password"}
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowDeactivatePassword(!showDeactivatePassword)}
                >
                  {showDeactivatePassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Escape Button Container */}
            <div className="relative h-20 flex items-center justify-center">
              <button
                ref={buttonRef}
                onClick={handleDeactivateAccount}
                disabled={isLoading || !isDeactivationReady}
                style={{
                  transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
                  transition: isDeactivationReady ? 'all 0.5s ease' : 'all 0.1s ease'
                }}
                className={`
                  px-5 py-2.5 text-white font-semibold rounded-lg flex items-center absolute
                  ${isDeactivationReady 
                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-lg transform scale-105' 
                    : 'bg-red-400 cursor-not-allowed'
                  }
                  ${isButtonEscaping ? 'shadow-xl' : ''}
                  transition-all duration-300
                `}
              >
                {isLoading ? (
                  <Loader className="animate-spin mr-2" />
                ) : (
                  <UserX className="mr-2" />
                )}
                {isDeactivationReady ? 'Deactivate My Account' : 'Complete Requirements First'}
              </button>
            </div>

            {/* Requirements Status */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
                <div className={`flex items-center ${deactivateConfirm ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${deactivateConfirm ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  Confirm understanding
                </div>
                <div className={`flex items-center ${deactivatePassword ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${deactivatePassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  Enter password
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;