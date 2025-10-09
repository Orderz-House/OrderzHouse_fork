import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  User, 
  Video, 
  Building, 
  Clock, 
  AlertCircle, 
  Archive,
  Eye,
  Download,
  CheckSquare,
  History
} from 'lucide-react';
import { useAppointments } from './hook/useAppointments';
import CreateAppointmentModal from './CreateAppointmentModal';
import RescheduleModal from './RescheduleModal';

const AdminAppointments = () => {
  const { userData } = useSelector((state) => state.auth);
  const {
    appointments,
    loading,
    error,
    setError,
    fetchAllAppointments,
    acceptAppointment,
    rejectAppointment,
    rescheduleAppointment,
    createAppointmentByAdmin,
    markAppointmentCompleted // تأكد من إضافة هذه الدالة في الـ hook
  } = useAppointments();

  const [showAddModal, setShowAddModal] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'completed'
  const [completedAppointments, setCompletedAppointments] = useState([]);

  // Website color scheme
  const colors = {
    primary: '#3B82F6',    // Blue
    secondary: '#10B981',  // Green
    accent: '#8B5CF6',     // Purple
    warning: '#F59E0B',    // Orange
    danger: '#EF4444',     // Red
    dark: '#1F2937',       // Dark Gray
    light: '#F3F4F6'       // Light Gray
  };

  useEffect(() => {
    fetchAllAppointments();
    // Load completed appointments from database
    loadCompletedAppointments();
  }, []);

  // Load completed appointments from database
  const loadCompletedAppointments = async () => {
    try {
      // افترض أن لديك دالة في الـ hook تجلب المواعيد المنتهية
      const completedFromDB = appointments.filter(app => app.status === 'completed');
      setCompletedAppointments(completedFromDB);
      
      // حفظ في localStorage كنسخة احتياطية
      localStorage.setItem('completedAppointments', JSON.stringify(completedFromDB));
    } catch (error) {
      console.error('Error loading completed appointments:', error);
      // Fallback to localStorage
      const savedCompleted = localStorage.getItem('completedAppointments');
      if (savedCompleted) {
        setCompletedAppointments(JSON.parse(savedCompleted));
      }
    }
  };

  // Save completed appointments to localStorage
  const saveCompletedAppointments = (completed) => {
    setCompletedAppointments(completed);
    localStorage.setItem('completedAppointments', JSON.stringify(completed));
  };

  // Mark appointment as complete - UPDATED VERSION
  const markAsComplete = async (appointment) => {
    try {
      const now = new Date();
      
      // Update appointment in database first
      const result = await markAppointmentCompleted(appointment.id);
      
      if (!result.success) {
        alert(result.error);
        return;
      }

      // Update appointment with completion time
      const completedAppointment = {
        ...appointment,
        completed_at: now.toISOString(),
        completed_by: userData?.id,
        status: 'completed' // Override status to completed
      };

      // Add to completed list
      const updatedCompleted = [...completedAppointments, completedAppointment];
      saveCompletedAppointments(updatedCompleted);

      // Refresh active appointments from database
      await fetchAllAppointments();
      
      alert(`Appointment marked as completed!`);
    } catch (error) {
      alert('Failed to mark appointment as completed');
      console.error('Error:', error);
    }
  };

  // Categorize appointments - UPDATED VERSION
  const categorizeAppointments = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter appointments based on database status
    const activeAppointments = appointments.filter(appointment => {
      return appointment.status !== 'completed';
    });

    return activeAppointments.reduce((acc, appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      const isToday = appointmentDate.toDateString() === now.toDateString();
      const isPast = appointmentDate < now;
      
      if (isToday) {
        acc.today.push(appointment);
      } else if (isPast) {
        acc.past.push(appointment);
      } else {
        acc.upcoming.push(appointment);
      }
      
      return acc;
    }, { today: [], upcoming: [], past: [] });
  };

  const { today, upcoming, past } = categorizeAppointments();
  
  // All active appointments (excluding completed from database)
  const allActiveAppointments = [...today, ...upcoming, ...past];

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

  const handleReschedule = async (appointmentId, newDate) => {
    const result = await rescheduleAppointment(appointmentId, newDate);
    if (result.success) {
      setRescheduleAppointmentId(null);
      fetchAllAppointments();
    } else {
      alert(result.error);
    }
  };

  // Validate date is not in past
  const isDateValid = (dateTime) => {
    const selectedDate = new Date(dateTime);
    const now = new Date();
    return selectedDate > now;
  };

  const getStatusColor = (status, appointmentDate) => {
    const isPast = new Date(appointmentDate) < new Date();
    
    // Check if appointment is completed in database
    const isCompleted = status === 'completed';
    
    if (isCompleted) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        label: 'Completed'
      };
    }

    if (isPast && status !== 'completed') {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        label: 'Expired'
      };
    }

    switch(status) {
      case 'accepted': 
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          label: 'Accepted'
        };
      case 'rejected': 
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          label: 'Rejected'
        };
      case 'pending': 
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          label: 'Pending'
        };
      case 'completed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-300',
          label: 'Completed'
        };
      default: 
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          label: 'Unknown'
        };
    }
  };

  const getTypeIcon = (type) => {
    return type === 'online' ? 
      <Video className="w-4 h-4" style={{ color: colors.primary }} /> : 
      <Building className="w-4 h-4" style={{ color: colors.secondary }} />;
  };

  // Professional Main Table Component
  const MainAppointmentsTable = ({ appointments, title, showActions = true, showCompleteButton = true }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{appointments.length} appointments</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Freelancer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Status
              </th>
              {showActions && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const statusInfo = getStatusColor(appointment.status, appointment.appointment_date);
              const isPast = new Date(appointment.appointment_date) < new Date();
              const isCompleted = appointment.status === 'completed';
              
              return (
                <tr 
                  key={appointment.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    isCompleted ? 'bg-gray-25' : isPast ? 'bg-orange-25' : 'bg-white'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-8 rounded-full ${
                        isCompleted ? 'bg-gray-400' : 
                        isPast ? 'bg-orange-400' : 
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(appointment.appointment_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {isPast && !isCompleted && (
                          <div className="text-xs text-orange-600 mt-1">⚠️ Past appointment</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {appointment.first_name} {appointment.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.freelancer_email}</div>
                        {appointment.freelancer_phone && (
                          <div className="text-xs text-gray-400">{appointment.freelancer_phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${
                      appointment.appointment_type === 'online' ? 'bg-blue-50' : 'bg-green-50'
                    }`}>
                      {getTypeIcon(appointment.appointment_type)}
                      <span className={`text-sm font-medium ${
                        appointment.appointment_type === 'online' ? 'text-blue-700' : 'text-green-700'
                      }`}>
                        {appointment.appointment_type === 'online' ? 'Online' : 'In Company'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {/* Accept/Reject for pending appointments */}
                        {appointment.status === 'pending' && !isCompleted && (
                          <>
                            <button
                              onClick={() => handleAccept(appointment.id)}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Accept Appointment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(appointment.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Reject Appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Reschedule button for active appointments */}
                        {!isCompleted && (
                          <button
                            onClick={() => setRescheduleAppointmentId(appointment.id)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Reschedule Appointment"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Complete button - shown for all non-completed appointments */}
                        {showCompleteButton && !isCompleted && (
                          <button
                            onClick={() => markAsComplete(appointment)}
                            className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Quick Statistics
  const stats = [
    { 
      label: 'Active Appointments', 
      value: allActiveAppointments.length, 
      color: colors.primary,
      icon: Calendar
    },
    { 
      label: "Today's Appointments", 
      value: today.length, 
      color: colors.secondary,
      icon: Clock
    },
    { 
      label: 'Upcoming', 
      value: upcoming.length, 
      color: colors.accent,
      icon: Eye
    },
    { 
      label: 'Completed', 
      value: completedAppointments.length, 
      color: colors.dark,
      icon: History
    }
  ];

  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
                <p className="text-gray-600 mt-2">Complete system with real-time validation and archiving</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">New Appointment</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 border border-gray-200">
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All Appointments', count: allActiveAppointments.length },
              { id: 'today', label: "Today's Schedule", count: today.length },
              { id: 'completed', label: 'Completed', count: completedAppointments.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center shadow-lg">
            <AlertCircle className="w-6 h-6 mr-4" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Content Based on Active Tab */}
        <div className="space-y-8">
          {/* All Active Appointments */}
          {activeTab === 'all' && (
            <MainAppointmentsTable 
              appointments={allActiveAppointments} 
              title="All Active Appointments - Management Panel"
              showActions={true}
              showCompleteButton={true}
            />
          )}

          {/* Today's Appointments */}
          {activeTab === 'today' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                    <p className="text-gray-600 mt-1">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {today.length} {today.length === 1 ? 'Appointment' : 'Appointments'}
                  </div>
                </div>
              </div>
              
              {today.length > 0 ? (
                <MainAppointmentsTable 
                  appointments={today} 
                  title="Today's Appointments - Priority Management"
                  showActions={true}
                  showCompleteButton={true}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Today</h3>
                  <p className="text-gray-600 mb-6">There are no appointments scheduled for today.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Schedule New Appointment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Completed Appointments */}
          {activeTab === 'completed' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <History className="w-8 h-8 text-gray-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Completed Appointments</h2>
                      <p className="text-gray-600 mt-1">Historical record of all completed appointments</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const dataStr = JSON.stringify(completedAppointments, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'completed-appointments.json';
                      link.click();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>
              
              {completedAppointments.length > 0 ? (
                <MainAppointmentsTable 
                  appointments={completedAppointments} 
                  title="Completed Appointments Archive"
                  showActions={false}
                  showCompleteButton={false}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Appointments</h3>
                  <p className="text-gray-600">Mark appointments as complete to see them here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Appointment Modal with Date Validation */}
        {showAddModal && (
          <CreateAppointmentModal 
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchAllAppointments();
            }}
            isAdmin={true}
            validateDate={isDateValid}
          />
        )}

        {/* Reschedule Modal */}
        {rescheduleAppointmentId && (
          <RescheduleModal
            appointmentId={rescheduleAppointmentId}
            onClose={() => setRescheduleAppointmentId(null)}
            onSuccess={(newDate) => handleReschedule(rescheduleAppointmentId, newDate)}
            validateDate={isDateValid}
          />
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;