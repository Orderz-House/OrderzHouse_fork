import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, X, Save, Eye, ArrowLeft, Search, Filter, Mail, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const PlansManager = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('plans'); // 'plans' or 'subscribers'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Plan form data
  const [planFormData, setPlanFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });
  
  // Subscriber form data - using freelancer_id to match backend expectations
  const [subscriberFormData, setSubscriberFormData] = useState({
    freelancer_id: '',
    plan_id: '',
    status: 'active'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState('plan'); // 'plan' or 'subscriber'

  const API_BASE = '/plans';
  const API_BASE_SUBSCRIPTION = '/subscriptions';

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE);
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans || []);
      } else {
        setError(data.message || 'Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Network error while fetching plans');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscribers for selected plan
  const fetchSubscribers = async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_SUBSCRIPTION}/plan/${planId}`);
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.subscribers || []); // Backend returns 'subscribers' array
      } else {
        setError(data.message || 'Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setError('Network error while fetching subscribers');
    } finally {
      setLoading(false);
    }
  };

  // Plan CRUD operations
  const handlePlanSubmit = async () => {
    if (!planFormData.name.trim() || !planFormData.price || !planFormData.duration || !planFormData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(planFormData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (parseInt(planFormData.duration) <= 0) {
      setError('Duration must be greater than 0 days');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditing ? `${API_BASE}/edit/${selectedPlan.id}` : `${API_BASE}/create`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...planFormData,
          price: parseFloat(planFormData.price),
          duration: parseInt(planFormData.duration)
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPlans();
        handleCloseModal();
      } else {
        setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} plan`);
      }
    } catch (error) {
      console.error('Error submitting plan:', error);
      setError('Network error while saving plan');
    } finally {
      setLoading(false);
    }
  };

  // Updated subscriber operations to work with freelancer_id-based system
  const handleSubscriberSubmit = async () => {
    if (!subscriberFormData.freelancer_id || !subscriberFormData.plan_id) {
      setError('Please enter freelancer ID and select a plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // For editing, we'll update the subscription
        const response = await fetch(`${API_BASE_SUBSCRIPTION}/${selectedPlan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: subscriberFormData.status,
            plan_id: subscriberFormData.plan_id
          }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchSubscribers(subscriberFormData.plan_id);
          handleCloseModal();
        } else {
          setError(data.message || 'Failed to update subscription');
        }
      } else {
        // For creating new subscription
        const response = await fetch(`${API_BASE_SUBSCRIPTION}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            freelancer_id: parseInt(subscriberFormData.freelancer_id),
            plan_id: parseInt(subscriberFormData.plan_id),
            status: subscriberFormData.status
          }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchSubscribers(subscriberFormData.plan_id);
          handleCloseModal();
        } else {
          setError(data.message || 'Failed to create subscription');
        }
      }
    } catch (error) {
      console.error('Error submitting subscription:', error);
      setError('Network error while saving subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/delete/${planId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await fetchPlans();
      } else {
        setError(data.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Network error while deleting plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_SUBSCRIPTION}/${subscriptionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubscribers(selectedPlan.id);
      } else {
        setError(data.message || 'Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setError('Network error while deleting subscription');
    } finally {
      setLoading(false);
    }
  };

  // View subscribers for plan
  const handleViewSubscribers = async (plan) => {
    setSelectedPlan(plan);
    setCurrentView('subscribers');
    await fetchSubscribers(plan.id);
  };

  // Modal handlers
  const handleOpenCreatePlanModal = () => {
    setPlanFormData({ name: '', price: '', duration: '', description: '' });
    setIsEditing(false);
    setEditingType('plan');
    setError(null);
    setShowModal(true);
  };

  const handleOpenEditPlanModal = (plan) => {
    setPlanFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      description: plan.description
    });
    setIsEditing(true);
    setEditingType('plan');
    setSelectedPlan(plan);
    setError(null);
    setShowModal(true);
  };

  const handleOpenCreateSubscriberModal = () => {
    setSubscriberFormData({
      freelancer_id: '',
      plan_id: selectedPlan.id,
      status: 'active'
    });
    setIsEditing(false);
    setEditingType('subscriber');
    setError(null);
    setShowModal(true);
  };

  const handleOpenEditSubscriberModal = (subscriber) => {
    setSubscriberFormData({
      freelancer_id: subscriber.freelancer_id?.toString() || '',
      plan_id: subscriber.plan_id?.toString() || selectedPlan.id.toString(),
      status: subscriber.status || 'active'
    });
    setIsEditing(true);
    setEditingType('subscriber');
    setSelectedPlan(subscriber);
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPlanFormData({ name: '', price: '', duration: '', description: '' });
    setSubscriberFormData({ freelancer_id: '', plan_id: '', status: 'active' });
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'plan') {
      setPlanFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setSubscriberFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = (subscriber.first_name + ' ' + subscriber.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };

    switch (status) {
      case 'active':
        return {
          ...baseStyle,
          backgroundColor: '#dcfce7',
          color: '#166534',
          icon: <CheckCircle size={12} />
        };
      case 'expired':
        return {
          ...baseStyle,
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          icon: <XCircle size={12} />
        };
      case 'cancelled':
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
          color: '#374151',
          icon: <XCircle size={12} />
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#fef3c7',
          color: '#92400e',
          icon: <Clock size={12} />
        };
    }
  };

  useEffect(() => {
    if (currentView === 'plans') {
      fetchPlans();
    }
  }, [currentView]);

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '32px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  };

  const backButtonStyle = {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    marginRight: '12px',
    color: '#1f2937',
    padding: '10px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0',
    display: 'flex',
    alignItems: 'center'
  };

  const createButtonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  const tableHeaderStyle = {
    backgroundColor: '#f9fafb',
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    backgroundColor: '#f9fafb',
    padding: '12px 24px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e5e7eb'
  };

  const tdStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #f3f4f6',
    color: '#1f2937'
  };

  const actionButtonStyle = {
    background: 'none',
    border: 'none',
    padding: '8px',
    margin: '0 4px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.15s ease'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: '1000'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.15s ease',
    marginTop: '8px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
    marginBottom: '8px'
  };

  const errorStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#dc2626'
  };

  return (
    <div style={containerStyle}>
      {currentView === 'plans' ? (
        <>
          {/* Plans View */}
          <div style={headerStyle}>
            <div style={titleStyle}>
              <button
                onClick={onBack}
                style={backButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ←
              </button>
              Plans Management
            </div>
            <button
              onClick={handleOpenCreatePlanModal}
              style={createButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              <Plus size={16} />
              Create Plan
            </button>
          </div>

          {error && (
            <div style={errorStyle}>
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ 
                display: 'inline-block',
                width: '32px',
                height: '32px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280', marginTop: '16px', fontSize: '14px' }}>Loading plans...</p>
            </div>
          )}

          {!loading && plans.length > 0 && (
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Plan Name</th>
                    <th style={thStyle}>Price</th>
                    <th style={thStyle}>Duration</th>
                    <th style={thStyle}>Description</th>
                    <th style={{...thStyle, textAlign: 'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan, index) => (
                    <tr 
                      key={plan.id} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{plan.name}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#059669' }}>${plan.price}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>{plan.duration} days</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>
                          {plan.description}
                        </div>
                      </td>
                      <td style={{...tdStyle, textAlign: 'center'}}>
                        <button
                          onClick={() => handleViewSubscribers(plan)}
                          style={actionButtonStyle}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#dbeafe';
                            e.target.style.color = '#1d4ed8';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#6b7280';
                          }}
                          title="View Subscribers"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditPlanModal(plan)}
                          style={actionButtonStyle}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                            e.target.style.color = '#374151';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#6b7280';
                          }}
                          title="Edit Plan"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          style={actionButtonStyle}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#fef2f2';
                            e.target.style.color = '#dc2626';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#6b7280';
                          }}
                          title="Delete Plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && plans.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 32px', backgroundColor: 'white', borderRadius: '12px', border: '2px dashed #d1d5db' }}>
              <div style={{ color: '#d1d5db', marginBottom: '24px' }}>
                <Plus size={48} style={{ margin: '0 auto', display: 'block' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>No Plans Found</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                Get started by creating your first subscription plan
              </p>
              <button
                onClick={handleOpenCreatePlanModal}
                style={createButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                Create First Plan
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Subscribers View */}
          <div style={headerStyle}>
            <div style={titleStyle}>
              <button
                onClick={() => setCurrentView('plans')}
                style={backButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ←
              </button>
              {selectedPlan?.name} - Subscribers
            </div>
            <button
              onClick={handleOpenCreateSubscriberModal}
              style={createButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              <Plus size={16} />
              Add Subscriber
            </button>
          </div>

          {error && (
            <div style={errorStyle}>
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={cardStyle}>
            <div style={tableHeaderStyle}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      ...inputStyle,
                      paddingLeft: '40px',
                      width: '300px',
                      margin: 0
                    }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '150px',
                    margin: 0
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '32px',
                  height: '32px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#6b7280', marginTop: '16px', fontSize: '14px' }}>Loading subscribers...</p>
              </div>
            )}

            {!loading && filteredSubscribers.length > 0 && (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Subscriber</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Start Date</th>
                    <th style={thStyle}>End Date</th>
                    <th style={{...thStyle, textAlign: 'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber, index) => {
                    const statusBadge = getStatusBadge(subscriber.status);
                    return (
                      <tr 
                        key={subscriber.id} 
                        style={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa'}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '20px',
                              backgroundColor: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#374151'
                            }}>
                              {(subscriber.first_name?.[0] || '') + (subscriber.last_name?.[0] || '')}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                {subscriber.first_name} {subscriber.last_name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                ID: {subscriber.freelancer_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{subscriber.email}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={statusBadge}>
                            {statusBadge.icon}
                            {subscriber.status}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {new Date(subscriber.start_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {new Date(subscriber.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{...tdStyle, textAlign: 'center'}}>
                          <button
                            onClick={() => handleOpenEditSubscriberModal(subscriber)}
                            style={actionButtonStyle}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6';
                              e.target.style.color = '#374151';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#6b7280';
                            }}
                            title="Edit Subscription"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            style={actionButtonStyle}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#fef2f2';
                              e.target.style.color = '#dc2626';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#6b7280';
                            }}
                            title="Delete Subscription"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && filteredSubscribers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                <div style={{ color: '#d1d5db', marginBottom: '24px' }}>
                  <Users size={48} style={{ margin: '0 auto', display: 'block' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  No Subscribers Found
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                  {searchTerm ? 'No subscribers match your search' : 'No subscribers for this plan yet'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleOpenCreateSubscriberModal}
                    style={createButtonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Add First Subscriber
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Plan/Subscriber Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0' }}>
                {editingType === 'plan' 
                  ? (isEditing ? 'Edit Plan' : 'Create New Plan')
                  : (isEditing ? 'Edit Subscription' : 'Add New Subscriber')}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={errorStyle}>
                <XCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {editingType === 'plan' ? (
              // Plan Form
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Plan Name</label>
                  <input
                    type="text"
                    name="name"
                    value={planFormData.name}
                    onChange={(e) => handleInputChange(e, 'plan')}
                    style={inputStyle}
                    placeholder="Enter plan name"
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={planFormData.price}
                    onChange={(e) => handleInputChange(e, 'plan')}
                    step="0.01"
                    min="0.01"
                    style={inputStyle}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Duration (days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={planFormData.duration}
                    onChange={(e) => handleInputChange(e, 'plan')}
                    min="1"
                    style={inputStyle}
                    placeholder="30"
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    name="description"
                    value={planFormData.description}
                    onChange={(e) => handleInputChange(e, 'plan')}
                    rows={3}
                    style={{...inputStyle, resize: 'none'}}
                    placeholder="Describe your plan features and benefits"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      flex: '1',
                      padding: '12px 20px',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlanSubmit}
                    disabled={loading}
                    style={{
                      flex: '1',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? '0.5' : '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
                  >
                    <Save size={16} />
                    {loading ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
                  </button>
                </div>
              </>
            ) : (
              // Subscriber Form - Updated to use freelancer_id input
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Freelancer ID</label>
                  <input
                    type="number"
                    name="freelancer_id"
                    value={subscriberFormData.freelancer_id}
                    onChange={(e) => handleInputChange(e, 'subscriber')}
                    style={inputStyle}
                    placeholder="Enter freelancer ID"
                    required
                    disabled={isEditing} // Disable freelancer_id editing for existing subscriptions
                  />
                  {isEditing && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Freelancer ID cannot be changed for existing subscriptions
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Plan</label>
                  <select
                    name="plan_id"
                    value={subscriberFormData.plan_id}
                    onChange={(e) => handleInputChange(e, 'subscriber')}
                    style={inputStyle}
                    required
                    disabled={isEditing} // Disable plan selection for existing subscriptions
                  >
                    <option value="">Select a plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price} ({plan.duration} days)
                      </option>
                    ))}
                  </select>
                  {isEditing && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Plan cannot be changed for existing subscriptions
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Status</label>
                  <select
                    name="status"
                    value={subscriberFormData.status}
                    onChange={(e) => handleInputChange(e, 'subscriber')}
                    style={inputStyle}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      flex: '1',
                      padding: '12px 20px',
                      border: '1px solid #d1d5db',
                      color: '#374151',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubscriberSubmit}
                    disabled={loading}
                    style={{
                      flex: '1',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? '0.5' : '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
                  >
                    <Save size={16} />
                    {loading ? 'Saving...' : (isEditing ? 'Update Subscription' : 'Add Subscriber')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PlansManager;