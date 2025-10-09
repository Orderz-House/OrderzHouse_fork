import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  User,
  MapPin,
  Video
} from 'lucide-react';
import { useAppointments } from '../../hook/useAppointments';
import RescheduleModal from './RescheduleModal';

const AppointmentList = ({ appointments, loading, activeView, isAdmin, isFreelancer }) => {
  const { acceptAppointment, rejectAppointment } = useAppointments();
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'online' ? 
      <Video className="w-4 h-4 text-blue-600" /> : 
      <MapPin className="w-4 h-4 text-green-600" />;
  };

  const handleAccept = async (appointmentId) => {
    const result = await acceptAppointment(appointmentId);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleReject = async (appointmentId) => {
    const result = await rejectAppointment(appointmentId);
    if (!result.success) {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 text-gray-400 mx-auto mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
        <p className="text-gray-600">
          {activeView === 'all' ? 'No appointments in the system.' : 'You have no appointments scheduled.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                {/* Type Icon */}
                {getTypeIcon(appointment.appointment_type)}
                
                {/* Status Badge */}
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="capitalize">{appointment.status}</span>
                </span>

                {/* Freelancer Info (for admin view) */}
                {isAdmin && activeView === 'all' && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{appointment.first_name} {appointment.last_name}</span>
                    <span>•</span>
                    <span>{appointment.freelancer_email}</span>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(appointment.appointment_date).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1 capitalize">
                  {appointment.appointment_type === 'online' ? '🌐 Online Meeting' : '🏢 In-Company Meeting'}
                </div>
              </div>

              {/* Message */}
              {appointment.message && (
                <p className="text-gray-700 text-sm mb-3 bg-gray-50 p-3 rounded-lg">
                  {appointment.message}
                </p>
              )}

              {/* Action Buttons - Only for freelancer's own pending appointments */}
              {isFreelancer && appointment.status === 'pending' && (
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleAccept(appointment.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleReject(appointment.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => setRescheduleAppointmentId(appointment.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Reschedule</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Reschedule Modal */}
      {rescheduleAppointmentId && (
        <RescheduleModal
          appointmentId={rescheduleAppointmentId}
          onClose={() => setRescheduleAppointmentId(null)}
          onSuccess={() => setRescheduleAppointmentId(null)}
        />
      )}
    </div>
  );
};

export default AppointmentList;