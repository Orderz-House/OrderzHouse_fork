import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  User,
  MapPin,
  Video,
  Calendar,
  MessageCircle,
  Mail,
  Phone
} from 'lucide-react';
import RescheduleModal from './RescheduleModal';

const AppointmentList = ({ 
  appointments, 
  loading, 
  activeView, 
  isAdmin, 
  isFreelancer, 
  onRefresh,
  onAccept,
  onReject,
  onReschedule 
}) => {
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
      <Video className="w-5 h-5 text-blue-600" /> : 
      <MapPin className="w-5 h-5 text-green-600" />;
  };

  const getTypeText = (type) => {
    return type === 'online' ? '🌐 Online Meeting' : '🏢 In-Company Meeting';
  };

  const isUpcoming = (appointmentDate) => {
    return new Date(appointmentDate) > new Date();
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
        <div className="w-16 h-16 text-gray-400 mx-auto mb-4">
          <Calendar className="w-16 h-16" />
        </div>
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
          className={`bg-white rounded-xl border-2 shadow-sm p-6 hover:shadow-md transition-all ${
            appointment.status === 'accepted' && isUpcoming(appointment.appointment_date) 
              ? 'border-green-200' 
              : appointment.status === 'pending'
              ? 'border-yellow-200'
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(appointment.appointment_type)}
                  
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="capitalize">{appointment.status}</span>
                  </span>

                  {appointment.status === 'accepted' && isUpcoming(appointment.appointment_date) && (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Clock className="w-4 h-4" />
                      <span>Upcoming</span>
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {isAdmin && appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onAccept(appointment.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        title="Accept Appointment"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => onReject(appointment.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        title="Reject Appointment"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {(isAdmin || (isFreelancer && appointment.status === 'pending')) && (
                    <button
                      onClick={() => setRescheduleAppointmentId(appointment.id)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      title="Reschedule Appointment"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Reschedule</span>
                    </button>
                  )}
                </div>
              </div>

              {isAdmin && activeView === 'all' && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {appointment.first_name} {appointment.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">{appointment.freelancer_email}</span>
                    </div>
                    {appointment.freelancer_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{appointment.freelancer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <div>
                    <span className="font-medium text-gray-900">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="font-medium text-gray-900">
                      {new Date(appointment.appointment_date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 capitalize">
                  {getTypeText(appointment.appointment_type)}
                </div>
              </div>

              {/* Message */}
              {appointment.message && (
                <div className="flex items-start space-x-3 text-sm text-gray-700 mb-4 bg-blue-50 p-4 rounded-lg">
                  <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 mb-1">Additional Notes:</p>
                    <p className="text-blue-800">{appointment.message}</p>
                  </div>
                </div>
              )}

              {/* Created At */}
              <div className="text-xs text-gray-500">
                Created: {new Date(appointment.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Reschedule Modal */}
      {rescheduleAppointmentId && (
        <RescheduleModal
          appointmentId={rescheduleAppointmentId}
          onClose={() => setRescheduleAppointmentId(null)}
          onSuccess={(newDate) => {
            setRescheduleAppointmentId(null);
            onReschedule?.(rescheduleAppointmentId, newDate);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};

export default AppointmentList;