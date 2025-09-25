import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// =================== CUSTOM HOOK TO GET AUTH INFO ===================
const useAuth = () => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token'); // Assuming you also store a token

  if (storedUser && storedToken) {
    try {
      const user = JSON.parse(storedUser);
      // Ensure the user object has the expected role_id property
      if (user && typeof user.role_id === 'number') {
        return { user, token: storedToken };
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  // If no valid user or token, return null for user
  return { user: null, token: null };
};
// ===================================================================


const plans = [
  { id: 1, name: "Free", description: "Perfect for getting started", subscriptionFee: "0", earnLimit: "100" },
  { id: 2, name: "1 month", description: "Best value for professionals", subscriptionFee: "20", earnLimit: "Unlimited" },
  { id: 3, name: "1 Year", description: "Most popular choice", subscriptionFee: "45", earnLimit: "Unlimited", isPopular: true },
  { id: 4, name: "2 Year Plan", description: "Maximum value for serious professionals", subscriptionFee: "65", earnLimit: "Unlimited" },
];

function PlanCard({ plan, user, navigate }) {

  const handleChoosePlan = () => {
    // --- CORRECTED LOGIC HERE ---
    // 1. Check if the user is NOT logged in.
    if (!user) {
      navigate('/login'); // Redirect to login page
      return;
    }

    // 2. If the user IS logged in, proceed to WhatsApp.
    // (The Plans page itself is already hidden for Clients by the parent component)
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
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#56a8b3ff"; }}
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
          background: "#028090",
          color: "white",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          fontWeight: "600"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor="#55b1eeff"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor="#028090"}
        onClick={handleChoosePlan}
      >
        Choose {plan.name}
      </button>
    </div>
  );
}

export default function Plans() {
  const { user } = useAuth(); // Get the user object from the hook
  const navigate = useNavigate();

  // Effect to handle redirection based on user role
  useEffect(() => {
    // If user is logged in AND their role_id is 2 (Client), redirect them.
    // This hides the entire Plans page for Clients.
    if (user && user.role_id === 2) {
      navigate("/Main"); // Redirect to a main dashboard or home page
    }
  }, [user, navigate]); // Re-run if user or navigate changes

  // If user is logged in AND their role_id is 2, render nothing (while redirecting)
  // This prevents the plans from briefly flashing on the screen for Clients.
  if (user && user.role_id === 2) {
    return null; 
  }

  // Styles (remain unchanged)
  const containerStyle = { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", padding: "2rem" };
  const noteStyle = {
    marginTop: "3rem",
    background: "linear-gradient(#028090, #02C39A)",
    padding: "2rem",
    borderRadius: "1rem",
    textAlign: "center",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#000000ff",
    maxWidth: "900px",
    marginLeft: "auto",
    marginRight: "auto"
  };
  const bodyStyle = {
    minHeight: "100vh",
    fontFamily: "Merriweather, serif",
    backgroundSize: "50px 50px",
    paddingBottom: "4rem"
  };

  return (
    <div style={bodyStyle}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "center", marginTop: "2rem", position: "static", top: "0", background: "linear-gradient(#028090, #02C39A)", padding: "1rem 0" }}>Our Pricing Plans</h1>
      <div style={containerStyle}>
        {plans.map(plan => (
          // Pass the user object and navigate function to PlanCard
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
