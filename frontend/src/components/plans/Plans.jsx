import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector

// =================== CUSTOM HOOK TO GET AUTH INFO (Using Redux) ===================
const useAuth = () => {
  // Get user data and token directly from the Redux store
  const { user, token } = useSelector((state) => ({
    user: state.auth.userData,
    token: state.auth.token,
  }));

  // The hook now returns the user and token from the global state
  return { user, token };
};
// =================================================================================

const plans = [
  { id: 1, name: "Free", description: "Perfect for getting started", subscriptionFee: "0", earnLimit: "100" },
  { id: 2, name: "1 month", description: "Best value for professionals", subscriptionFee: "20", earnLimit: "Unlimited" },
  { id: 3, name: "1 Year", description: "Most popular choice", subscriptionFee: "45", earnLimit: "Unlimited", isPopular: true },
  { id: 4, name: "2 Year Plan", description: "Maximum value for serious professionals", subscriptionFee: "65", earnLimit: "Unlimited" },
];

function PlanCard({ plan, user, navigate }) {

  const handleChoosePlan = () => {
    // *** MODIFICATION: Logic updated to match requirements ***

    // 1. If the user is NOT logged in, redirect to the login page.
    if (!user) {
      navigate('/login');
      return;
    }

    // 2. If the user has role_id 3 (Freelancer), redirect to WhatsApp.
    if (user.role_id === 3) {
      const baseUrl = "https://api.whatsapp.com/send/";
      const phoneNumber = "962791433341"; // Your WhatsApp Number
      const message = `I am a freelancer and I want to subscribe to this plan: ${plan.name}`;
      const encodedMessage = encodeURIComponent(message );
      const finalUrl = `${baseUrl}?phone=${phoneNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
      
      window.open(finalUrl, '_blank');
      return;
    }
    
    // 3. For any other authenticated user (like Admins), redirect to WhatsApp as a fallback.
    //    (Clients with role_id 2 will never see this page anyway).
    const baseUrl = "https://api.whatsapp.com/send/";
    const phoneNumber = "962791433341";
    const message = `I want to subscribe to this plan: ${plan.name}`;
    const encodedMessage = encodeURIComponent(message );
    const finalUrl = `${baseUrl}?phone=${phoneNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    
    window.open(finalUrl, '_blank');
  };

  return (
    <div
      style={{
        width: "18rem",
        minHeight: "24rem",
        border: `0.3rem solid ${plan.isPopular ? "#026d80ff" : "gray"}`,
        borderRadius: "1.2rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        margin: "1rem",
        padding: "1.5rem",
        textAlign: "center",
        fontFamily: "Merriweather, serif",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        position: "relative",
        cursor: "pointer"
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f0f9ff"; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}
    >
      {plan.isPopular && (
        <span style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          backgroundColor: "#88e4dfff",
          color: "#028090",
          fontSize: "0.7rem",
          fontWeight: "600",
          padding: "0.25rem 0.5rem",
          borderRadius: "9999px"
        }}>Popular</span>
      )}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{plan.name}</h2>
        <p style={{ marginTop: "1rem", fontSize: "2.5rem", fontWeight: "700" }}>{plan.subscriptionFee} JD</p>
        <p style={{ color: "#000000ff", marginTop: "0.5rem", fontSize: "0.9rem" }}>Earn Limit: {plan.earnLimit}</p>
        <p style={{ marginTop: "1rem", fontSize: "1.5rem", color: "#065f46" }}>{plan.description}</p>
      </div>
      <button 
        style={{
          marginTop: "1.5rem",
          width: "100%",
          background: "#005f6bff",
          color: "white",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          fontWeight: "600",
          border: "none",
          cursor: "pointer"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor="#026e7a"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor="#028090"}
        onClick={handleChoosePlan}
      >
        Choose {plan.name}
      </button>
    </div>
  );
}

export default function Plans() {
  const { user } = useAuth(); // Get user from Redux via the hook
  const navigate = useNavigate();

  // Effect to hide the entire page for Clients (role_id 2)
  useEffect(() => {
    if (user && user.role_id === 2) {
      navigate("/"); // Redirect to home page or another appropriate page
    }
  }, [user, navigate]);

  // Prevent rendering the component for role_id 2 to avoid a screen flash
  if (user && user.role_id === 2) {
    return null; 
  }

  // Styles
  const containerStyle = { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", padding: "2rem" };
  const noteStyle = {
    marginTop: "3rem",
    background: "linear-gradient(to right, #e0f7fa, #b2ebf2)",
    padding: "2rem",
    borderRadius: "1rem",
    textAlign: "center",
    fontSize: "1.3rem",
    fontWeight: "600",

    color: "#026e7a",
=======
    color: "#004d40",

    maxWidth: "900px",
    marginLeft: "auto",
    marginRight: "auto",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  };
  const bodyStyle = {
    minHeight: "100vh",
    fontFamily: "Merriweather, serif",
    background: "#f7fafc",
    paddingBottom: "4rem"
  };

  return (
    <div style={bodyStyle}>

      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "center", marginTop: "0.05rem", background:"linear-gradient(to right, #e0f7fa, #b2ebf2)" }}>Our Pricing Plans</h1>
=======
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "center", marginTop: "2rem", color: "#004d40" }}>Our Pricing Plans</h1>

      <div style={containerStyle}>
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} user={user} navigate={navigate} />
        ))}
      </div>
      <div style={noteStyle}>
        <p>* A contract is signed after subscription.</p>
        <p>* Account verification fee is a one-time payment across all plans (25 JD).</p>
      </div>
    </div>
  );
}
