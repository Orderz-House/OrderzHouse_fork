import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  Plus, 
  Users,
  User
} from 'lucide-react';
import { useAppointments } from '../../hook/useAppointments';
import CreateAppointmentModal from './CreateAppointmentModal';
import AppointmentList from './AppointmentList';
import AdminAppointmentModal from './AdminAppointmentModal';

const Appointments = () => {
  const { userData } = useSelector((state) => state.auth);
  const {
    appointments,
    loading,
    error,
    setError,
    fetchAllAppointments,
    fetchMyAppointments
  } = useAppointments();

  const [activeView, setActiveView] = useState('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const isAdmin = userData?.role_id === 1;
  const isFreelancer = userData?.role_id === 3;

  useEffect(() => {
    if (activeView === 'all' && isAdmin) {
      fetchAllAppointments();
    } else if (isFreelancer) {
      fetchMyAppointments();
    }
  }, [activeView, isAdmin, isFreelancer]);

  const handleViewChange = (view) => {
    setActiveView(view);
    setError('');
  };

  const handleRefresh = () => {
    if (activeView === 'all' && isAdmin) {
      fetchAllAppointments();
    } else {
      fetchMyAppointments();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600">Manage your meetings and schedules</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {isFreelancer && (
                  <button
                    onClick={() => handleViewChange('my')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeView === 'my'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    My Appointments
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleViewChange('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeView === 'all'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    All Appointments
                  </button>
                )}
              </div>

              {/* Create Buttons */}
              {isFreelancer && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Appointment</span>
                </button>
              )}
              
              {isAdmin && (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create for Freelancer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="ml-4 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Appointments List */}
        <AppointmentList
          appointments={appointments}
          loading={loading}
          activeView={activeView}
          isAdmin={isAdmin}
          isFreelancer={isFreelancer}
        />

        {/* Modals */}
        {showCreateModal && (
          <CreateAppointmentModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchMyAppointments();
            }}
          />
        )}

        {showAdminModal && (
          <AdminAppointmentModal
            onClose={() => setShowAdminModal(false)}
            onSuccess={() => {
              setShowAdminModal(false);
              fetchAllAppointments();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Appointments;