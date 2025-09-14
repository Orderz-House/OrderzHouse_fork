import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, X, Save, Search, Mail, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import Loader from "../admin-components/loader/loader.jsx"; 

const PlansManager = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [planFormData, setPlanFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });
  
  const [subscriberFormData, setSubscriberFormData] = useState({
    identifier: '',
    identifierType: 'email',
    plan_id: '',
    status: 'active'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState('plan');

  const API_BASE = '/plans';
  const API_BASE_SUBSCRIPTION = '/subscriptions';

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
      setError('Network error while fetching plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_SUBSCRIPTION}/plan/${planId}`);
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
      } else {
        setError(data.message || 'Failed to fetch subscribers');
        setSubscribers([]);
      }
    } catch (error) {
      setError('Network error while fetching subscribers');
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

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
      setError('Network error while saving plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriberSubmit = async () => {
    if (!subscriberFormData.identifier || !subscriberFormData.plan_id) {
      setError(`Please enter ${subscriberFormData.identifierType} and select a plan`);
      return;
    }

    if (subscriberFormData.identifierType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(subscriberFormData.identifier)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    if (subscriberFormData.identifierType === 'id') {
      if (isNaN(subscriberFormData.identifier) || parseInt(subscriberFormData.identifier) <= 0) {
        setError('Please enter a valid user ID (positive number)');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
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
        const requestBody = {
          plan_id: parseInt(subscriberFormData.plan_id),
          status: subscriberFormData.status
        };

        if (subscriberFormData.identifierType === 'email') {
          requestBody.email = subscriberFormData.identifier;
        } else {
          requestBody.freelancer_id = parseInt(subscriberFormData.identifier);
        }

        const response = await fetch(`${API_BASE_SUBSCRIPTION}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
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
      setError('Network error while deleting subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscribers = async (plan) => {
    setSelectedPlan(plan);
    setCurrentView('subscribers');
    await fetchSubscribers(plan.id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPlanFormData({ name: '', price: '', duration: '', description: '' });
    setSubscriberFormData({ identifier: '', identifierType: 'email', plan_id: '', status: 'active' });
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

  const commonStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '32px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    button: {
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
      transition: 'all 0.2s ease'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'all 0.15s ease',
      marginTop: '8px',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={commonStyles.container}>
      {currentView === 'plans' ? (
        <>
          {/* Plans Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: '0', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={onBack}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  fontSize: '20px', 
                  cursor: 'pointer', 
                  marginRight: '12px', 
                  padding: '10px 12px', 
                  borderRadius: '8px' 
                }}
              >
                ←
              </button>
              Plans Management
            </div>
            <button
              onClick={() => {
                setPlanFormData({ name: '', price: '', duration: '', description: '' });
                setIsEditing(false);
                setEditingType('plan');
                setError(null);
                setShowModal(true);
              }}
              style={commonStyles.button}
            >
              <Plus size={16} />
              Create Plan
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#dc2626'
            }}>
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading && <Loader message="Loading plans..." />}


          {!loading && plans.length > 0 && (
            <div style={commonStyles.card}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Plan Name</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Price</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Duration</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan, index) => (
                    <tr key={plan.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{plan.name}</div>
                      </td>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#059669' }}>${plan.price}</div>
                      </td>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>{plan.duration} days</div>
                      </td>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>{plan.description}</div>
                      </td>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewSubscribers(plan)}
                          style={{ background: 'none', border: 'none', padding: '8px', margin: '0 4px', borderRadius: '6px', cursor: 'pointer' }}
                          title="View Subscribers"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => {
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
                          }}
                          style={{ background: 'none', border: 'none', padding: '8px', margin: '0 4px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Edit Plan"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          style={{ background: 'none', border: 'none', padding: '8px', margin: '0 4px', borderRadius: '6px', cursor: 'pointer' }}
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
              <Plus size={48} style={{ margin: '0 auto 24px', display: 'block', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>No Plans Found</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Get started by creating your first subscription plan</p>
              <button
                onClick={() => {
                  setPlanFormData({ name: '', price: '', duration: '', description: '' });
                  setIsEditing(false);
                  setEditingType('plan');
                  setError(null);
                  setShowModal(true);
                }}
                style={commonStyles.button}
              >
                Create First Plan
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Subscribers View */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: '0', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentView('plans')}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '12px', padding: '10px 12px', borderRadius: '8px' }}
              >
                ←
              </button>
              {selectedPlan?.name} - Subscribers
            </div>
            <button
              onClick={() => {
                setSubscriberFormData({
                  identifier: '',
                  identifierType: 'email',
                  plan_id: selectedPlan.id,
                  status: 'active'
                });
                setIsEditing(false);
                setEditingType('subscriber');
                setError(null);
                setShowModal(true);
              }}
              style={commonStyles.button}
            >
              <Plus size={16} />
              Add Subscriber
            </button>
          </div>

          {/* {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#dc2626'
            }}>
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          )} */}

          <div style={commonStyles.card}>
            <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ ...commonStyles.input, paddingLeft: '40px', width: '300px', margin: 0 }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ ...commonStyles.input, width: '150px', margin: 0 }}
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

            {loading && <Loader message="Loading subscribers..." />}


            {!loading && filteredSubscribers.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Subscriber</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Start Date</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>End Date</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber, index) => {
                    const statusBadge = getStatusBadge(subscriber.status);
                    return (
                      <tr key={subscriber.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
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
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{subscriber.email}</div>
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={statusBadge}>
                            {statusBadge.icon}
                            {subscriber.status}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {new Date(subscriber.start_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {new Date(subscriber.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSubscriberFormData({
                                identifier: subscriber.freelancer_id?.toString() || '',
                                identifierType: 'id',
                                plan_id: subscriber.plan_id?.toString() || selectedPlan.id.toString(),
                                status: subscriber.status || 'active'
                              });
                              setIsEditing(true);
                              setEditingType('subscriber');
                              setSelectedPlan(subscriber);
                              setError(null);
                              setShowModal(true);
                            }}
                            style={{ background: 'none', border: 'none', padding: '8px', margin: '0 4px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit Subscription"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            style={{ background: 'none', border: 'none', padding: '8px', margin: '0 4px', borderRadius: '6px', cursor: 'pointer' }}
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
                <Users size={48} style={{ margin: '0 auto 24px', display: 'block', color: '#d1d5db' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  No Subscribers Found
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                  {searchTerm ? 'No subscribers match your search' : 'No subscribers for this plan yet'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0' }}>
                {editingType === 'plan' 
                  ? (isEditing ? 'Edit Plan' : 'Create New Plan')
                  : (isEditing ? 'Edit Subscription' : 'Add Subscriber')
                }
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#dc2626'
              }}>
                <XCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {editingType === 'plan' ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={planFormData.name}
                    onChange={(e) => handleInputChange(e, 'plan')}
                    placeholder="Enter plan name"
                    style={commonStyles.input}
                    disabled={loading}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={planFormData.price}
                      onChange={(e) => handleInputChange(e, 'plan')}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={commonStyles.input}
                      disabled={loading}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                      Duration (days) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={planFormData.duration}
                      onChange={(e) => handleInputChange(e, 'plan')}
                      placeholder="30"
                      min="1"
                      style={commonStyles.input}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={planFormData.description}
                    onChange={(e) => handleInputChange(e, 'plan')}
                    placeholder="Enter plan description"
                    rows="4"
                    style={{ ...commonStyles.input, resize: 'vertical' }}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                    Identifier Type
                  </label>
                  <select
                    name="identifierType"
                    value={subscriberFormData.identifierType}
                    onChange={(e) => handleInputChange(e, 'subscriber')}
                    style={commonStyles.input}
                    disabled={loading || isEditing}
                  >
                    <option value="email">Email Address</option>
                    <option value="id">User ID</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                    {subscriberFormData.identifierType === 'email' ? 'Email Address' : 'User ID'} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    {subscriberFormData.identifierType === 'email' ? 
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} /> :
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    }
                    <input
                      type={subscriberFormData.identifierType === 'email' ? 'email' : 'number'}
                      name="identifier"
                      value={subscriberFormData.identifier}
                      onChange={(e) => handleInputChange(e, 'subscriber')}
                      placeholder={subscriberFormData.identifierType === 'email' ? 'user@example.com' : '12345'}
                      style={{ ...commonStyles.input, paddingLeft: '40px' }}
                      disabled={loading || isEditing}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                    Plan *
                  </label>
                  <select
                    name="plan_id"
                    value={subscriberFormData.plan_id}
                    onChange={(e) => handleInputChange(e, 'subscriber')}
                    style={commonStyles.input}
                    disabled={loading}
                  >
                    <option value="">Select a plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price} ({plan.duration} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={subscriberFormData.status}
                    onChange={(e) => handleInputChange(e, 'subscriber')}
                    style={commonStyles.input}
                    disabled={loading}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleCloseModal}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={editingType === 'plan' ? handlePlanSubmit : handleSubscriberSubmit}
                style={{ ...commonStyles.button, opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansManager