import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  BookOpen,
  Calendar,
  Rocket,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";
import Loader from "../admin-components/loader/loader.jsx";
import UsersAnalytics from "../admin-components/analytics/userAnalytics.jsx";

const AnalyticsDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Animate cards after loading
      setTimeout(() => {
        setVisibleCards(new Set([0, 1, 2, 3, 4, 5]));
      }, 300);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const navigationCards = [
    {
      id: "users",
      title: "Users Analytics",
      description: "User registration trends, demographics, and engagement metrics",
      icon: <Users size={20} />,
      navigationType: "page",
      color: "#a78bfa",
      stats: "-- users",
      trend: "--%"
    },
    {
      id: "payments",
      title: "Payments Analytics",
      description: "Revenue tracking, payment insights, and financial performance",
      icon: <DollarSign size={20} />,
      navigationType: "page",
      color: "#86efac",
      stats: "$-- revenue",
      trend: "--%"
    },
    {
      id: "courses",
      title: "Courses Analytics",
      description: "Course performance, enrollment data, and completion rates",
      icon: <BookOpen size={20} />,
      navigationType: "page",
      color: "#7dd3fc",
      stats: "-- courses",
      trend: "--%"
    },
    {
      id: "appointments",
      title: "Appointments Analytics",
      description: "Booking patterns, scheduling insights, and availability metrics",
      icon: <Calendar size={20} />,
      navigationType: "page",
      color: "#fdba74",
      stats: "-- bookings",
      trend: "--%"
    },
    {
      id: "projects",
      title: "Projects Analytics",
      description: "Project progress, completion rates, and team performance",
      icon: <Rocket size={20} />,
      navigationType: "page",
      color: "#c4b5fd",
      stats: "-- projects",
      trend: "--%"
    },
    {
      id: "plans",
      title: "Plans Analytics",
      description: "Subscription metrics, plan performance, and customer retention",
      icon: <BarChart3 size={20} />,
      navigationType: "page",
      color: "#fca5a5",
      stats: "-- subscriptions",
      trend: "--%"
    },
  ];

  const handleCardClick = (card) => {
    if (card.navigationType === "page") {
      setCurrentPage(card.id);
    } else {
      setActiveSection(card.id);
      setCurrentPage("dashboard");
    }
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
    setActiveSection("overview");
  };

  if (loading) {
    return <Loader />;
  }

  // Render different pages based on currentPage state
  if (currentPage === "users") {
    return (
      <div className="analytics-container">
        <style>
          {`
            .analytics-container {
              background-color: #f8fafc;
              min-height: 100vh;
              padding: 32px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #334155;
            }

            .back-button {
              background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              cursor: pointer;
              font-weight: 500;
              font-size: 14px;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
              margin-bottom: 24px;
            }

            .back-button:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 12px -2px rgba(79, 70, 229, 0.5);
              background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
            }
          `}
        </style>
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to Analytics Dashboard
        </button>
        <UsersAnalytics />
      </div>
    );
  }

  // Handle other pages (payments, courses, appointments, projects, plans)
  if (currentPage !== "dashboard") {
    const currentCard = navigationCards.find(card => card.id === currentPage);
    return (
      <div className="analytics-container">
        <style>
          {`
            .analytics-container {
              background-color: #f8fafc;
              min-height: 100vh;
              padding: 32px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #334155;
            }

            .back-button {
              background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              cursor: pointer;
              font-weight: 500;
              font-size: 14px;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
              margin-bottom: 24px;
            }

            .back-button:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 12px -2px rgba(79, 70, 229, 0.5);
              background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
            }

            .page-content {
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 32px;
              text-align: center;
            }

            .page-icon {
              width: 80px;
              height: 80px;
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              color: white;
            }

            .page-title {
              font-size: 2rem;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 12px 0;
            }

            .page-description {
              color: #64748b;
              font-size: 16px;
              margin: 0 0 24px 0;
              max-width: 500px;
              margin-left: auto;
              margin-right: auto;
            }

            .page-stats {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: #f1f5f9;
              padding: 12px 20px;
              border-radius: 24px;
              font-weight: 600;
              color: #0f172a;
            }
          `}
        </style>
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to Analytics Dashboard
        </button>
        <div className="page-content">
          <div 
            className="page-icon" 
            style={{ background: currentCard.color }}
          >
            {React.cloneElement(currentCard.icon, { size: 40 })}
          </div>
          <h1 className="page-title">{currentCard.title}</h1>
          <p className="page-description">{currentCard.description}</p>
          <div className="page-stats">
            <TrendingUp size={16} />
            {currentCard.stats} • {currentCard.trend}
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      default:
        return (
          <div className="analytics-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <BarChart3 size={48} />
              </div>
              <h3>Analytics Coming Soon</h3>
              <p>
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} analytics 
                visualization will be available here
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="analytics-container">
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .analytics-container {
            background-color: #f8fafc;
            min-height: 100vh;
            padding: 32px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #334155;
          }

          .analytics-header {
            margin-bottom: 32px;
            animation: fadeInUp 0.6s ease-out;
          }

          .analytics-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #0f172a;
            letter-spacing: -0.025em;
          }

          .analytics-header p {
            margin: 0;
            color: #64748b;
            font-size: 16px;
            font-weight: 400;
          }

          .analytics-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
          }

          .overview-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            text-align: center;
            animation: fadeInUp 0.6s ease-out;
          }

          .overview-card h3 {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 8px 0;
          }

          .overview-card p {
            color: #64748b;
            font-size: 14px;
            margin: 0;
          }

          .analytics-section {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            animation: fadeInUp 0.6s ease-out 0.2s both;
          }

          .section-header {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 24px 28px;
            border-bottom: 1px solid #e2e8f0;
          }

          .section-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .section-header p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }

          .analytics-list {
            padding: 0;
          }

          .analytics-card {
            background: white;
            padding: 20px 28px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 1px solid #f1f5f9;
            position: relative;
            display: flex;
            align-items: center;
            gap: 20px;
            opacity: 0;
            transform: translateX(-10px);
          }

          .analytics-card:last-child {
            border-bottom: none;
          }

          .analytics-card.visible {
            animation: fadeInUp 0.4s ease-out forwards;
          }

          .analytics-card:hover {
            background: #f8fafc;
            transform: translateX(4px);
            box-shadow: inset 4px 0 0 var(--card-color);
          }

          .card-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--card-color);
            color: white;
            flex-shrink: 0;
            transition: all 0.2s ease;
          }

          .analytics-card:hover .card-icon {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(var(--card-color-rgb), 0.3);
          }

          .card-content {
            flex: 1;
            min-width: 0;
          }

          .card-content h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0 0 4px 0;
            line-height: 1.3;
          }

          .card-content p {
            font-size: 14px;
            color: #64748b;
            margin: 0;
            line-height: 1.4;
          }

          .card-stats {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            margin-right: 12px;
          }

          .card-stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
          }

          .card-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #10b981;
            font-weight: 600;
          }

          .card-badge {
            font-size: 12px;
            color: var(--card-color);
            font-weight: 600;
            background: rgba(var(--card-color-rgb), 0.1);
            padding: 6px 12px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
          }

          .analytics-placeholder {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 60px 40px;
            text-align: center;
            animation: fadeInUp 0.6s ease-out 0.4s both;
            margin-top: 40px;
          }

          .placeholder-content {
            max-width: 400px;
            margin: 0 auto;
          }

          .placeholder-icon {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: #f1f5f9;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
          }

          .placeholder-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0 0 8px 0;
          }

          .placeholder-content p {
            color: #64748b;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .analytics-container {
              padding: 20px;
            }
            
            .analytics-overview {
              grid-template-columns: 1fr;
            }
            
            .analytics-header h1 {
              font-size: 2rem;
            }

            .analytics-card {
              padding: 16px 20px;
              gap: 16px;
            }

            .card-stats {
              display: none;
            }

            .section-header {
              padding: 20px;
            }
          }

          @media (max-width: 1024px) {
            .analytics-overview {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}
      </style>
      
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive insights and performance metrics across all platform modules</p>
      </div>

      <div className="analytics-overview">
        <div className="overview-card">
          <h3>6</h3>
          <p>Analytics Modules</p>
        </div>
        <div className="overview-card">
          <h3>15.2K</h3>
          <p>Total Data Points</p>
        </div>
        <div className="overview-card">
          <h3>94%</h3>
          <p>System Health</p>
        </div>
      </div>

      <div className="analytics-section">
        <div className="section-header">
          <h2>
            <Activity size={24} />
            Analytics Modules
          </h2>
          <p>Access detailed insights for each platform component</p>
        </div>
        
        <div className="analytics-list">
          {navigationCards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`analytics-card ${visibleCards.has(index) ? 'visible' : ''}`}
              style={{
                '--card-color': card.color,
                '--card-color-rgb': card.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(', '),
                animationDelay: `${index * 0.08}s`
              }}
            >
              <div className="card-icon">
                {card.icon}
              </div>
              
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>

              <div className="card-stats">
                <div className="card-stat-value">{card.stats}</div>
                <div className="card-trend">
                  <TrendingUp size={12} />
                  {card.trend}
                </div>
              </div>

              <div className="card-badge">
                Full Page View →
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentPage === "dashboard" && activeSection !== "overview" && (
        <>
          {renderSection()}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;