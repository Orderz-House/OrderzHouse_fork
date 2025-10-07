import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Shield, Key, Power, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toastError, toastSuccess } from '../../services/toastService';

// Reusable component for each settings card
const SettingsCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const AccountSettings = () => {
  const { token } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // State for 2FA
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false); // This would come from user data

  // State for account deactivation
  const [deactivateConfirm, setDeactivateConfirm] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long.';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsSubmitting(true);
    try {
      // API endpoint to change password
      // This endpoint needs to be created on your backend
      await axios.put('/api/users/me/change-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toastSuccess('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toastError(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (deactivateConfirm !== 'deactivate my account') {
      toastError('Please type the confirmation phrase correctly.');
      return;
    }
    setIsSubmitting(true);
    try {
      // API endpoint to deactivate account
      // This endpoint needs to be created on your backend
      await axios.delete('/api/users/me/deactivate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      toastSuccess('Account deactivated. You will be logged out.');
      // Here you would typically dispatch a logout action
    } catch (error) {
      toastError(error.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Card */}
      <SettingsCard title="Change Password" icon={<Key className="w-5 h-5 text-gray-500" />}>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-lg ${passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-300'}`}
            />
            {passwordErrors.currentPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-lg ${passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'}`}
            />
            {passwordErrors.newPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-lg ${passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
            />
            {passwordErrors.confirmPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword}</p>}
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </SettingsCard>

      {/* Two-Factor Authentication Card */}
      <SettingsCard title="Two-Factor Authentication (2FA)" icon={<Shield className="w-5 h-5 text-gray-500" />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-800">
              {isTwoFactorEnabled ? '2FA is currently enabled.' : 'Add an extra layer of security to your account.'}
            </p>
            <p className="text-sm text-gray-500">
              {isTwoFactorEnabled ? 'You will be asked for a code when you sign in.' : 'You will need an authenticator app.'}
            </p>
          </div>
          <button
            onClick={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
            className={`px-4 py-2 font-semibold rounded-lg ${isTwoFactorEnabled ? 'bg-gray-200 text-gray-800' : 'bg-green-600 text-white'}`}
          >
            {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </SettingsCard>

      {/* Deactivate Account Card */}
      <SettingsCard title="Danger Zone" icon={<AlertTriangle className="w-5 h-5 text-red-500" />}>
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <h4 className="font-bold text-red-800">Deactivate Account</h4>
          <p className="text-sm text-red-700 mt-1">
            Once you deactivate your account, there is no going back. All your data will be permanently deleted. Please be certain.
          </p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-red-900 mb-1">
              To confirm, type "deactivate my account" below:
            </label>
            <input
              type="text"
              value={deactivateConfirm}
              onChange={(e) => setDeactivateConfirm(e.target.value)}
              className="w-full p-2 border border-red-300 rounded-lg"
            />
            <button
              onClick={handleDeactivateAccount}
              disabled={isSubmitting || deactivateConfirm !== 'deactivate my account'}
              className="mt-3 w-full px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              <Power className="w-4 h-4 mr-2 inline" />
              Deactivate My Account
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

export default AccountSettings;
