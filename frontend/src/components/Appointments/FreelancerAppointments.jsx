import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Plus, AlertCircle, Clock, User, BarChart3 } from 'lucide-react';
import { useAppointments } from './hook/useAppointments';
import CreateAppointmentModal from './CreateAppointmentModal';
import AppointmentList from './AppointmentList';

const FreelancerAppointments = () => {
  const { userData } = useSelector((state) => state.auth);
  const {
    appointments,
    loading,
    error,
    setError,
    fetchMyAppointments,
    createAppointment,
    rescheduleAppointment
  } = useAppointments();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeView, setActiveView] = useState('my');

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const canCreateAppointment = () => {
    // Check if user has any active (pending/accepted) appointments
    const activeAppointments = appointments.filter(apt => 
      apt.status === 'pending' || apt.status === 'accepted'
    );
    return activeAppointments.length === 0;
  };

  const handleReschedule = async (appointmentId, newDate) => {
    const result = await rescheduleAppointment(appointmentId, newDate);
    if (!result.success) {
      alert(result.error);
    }
  };

  // Statistics for freelancer
  const stats = {
    total: appointments.length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    accepted: appointments.filter(apt => apt.status === 'accepted').length,
    rejected: appointments.filter(apt => apt.status === 'rejected').length,
    upcoming: appointments.filter(apt => 
      apt.status === 'accepted' && new Date(apt.appointment_date) > new Date()
    ).length,
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );

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
                <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600">Manage your scheduled meetings and appointments</p>
              </div>
            </div>
            
            {canCreateAppointment() ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>New Appointment</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Active Appointment</p>
                  <p className="text-xs">Complete current appointment to schedule new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Appointments"
            value={stats.total}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            color="bg-blue-100"
            description="All your appointments"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
            color="bg-yellow-100"
            description="Waiting for approval"
          />
          <StatCard
            title="Accepted"
            value={stats.accepted}
            icon={<User className="w-6 h-6 text-green-600" />}
            color="bg-green-100"
            description="Confirmed appointments"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcoming}
            icon={<Clock className="w-6 h-6 text-purple-600" />}
            color="bg-purple-100"
            description="Future meetings"
          />
        </div>

        {/* Quick Actions */}
        {canCreateAppointment() && stats.total === 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to schedule your first appointment?</h3>
                <p className="text-blue-100">Book a meeting with the admin to discuss your projects and opportunities.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Schedule Now
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Showing {appointments.length} appointments</span>
              <button
                onClick={fetchMyAppointments}
                className="ml-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          <AppointmentList
            appointments={appointments}
            loading={loading}
            activeView={activeView}
            isAdmin={false}
            isFreelancer={true}
            onRefresh={fetchMyAppointments}
            onReschedule={handleReschedule}
          />
        </div>

        {/* Help Section */}
        {appointments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Appointment Guidelines</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• You can only have one active (pending/accepted) appointment at a time</li>
                  <li>• Pending appointments can be rescheduled</li>
                  <li>• Once accepted, appointments cannot be cancelled</li>
                  <li>• Rejected appointments can be re-requested</li>
                  <li>• Contact admin for urgent schedule changes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Add Appointment Modal */}
        {showAddModal && (
          <CreateAppointmentModal 
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchMyAppointments();
            }}
            isAdmin={false}
          />
        )}
      </div>
    </div>
  );
};

export default FreelancerAppointments;