import React from "react";

const plans = [
  { id: 1, name: "Free", description: "Perfect for getting started", subscriptionFee: "0", earnLimit: "100" },
  { id: 2, name: "1 month", description: "Best value for professionals", subscriptionFee: "20", earnLimit: "Unlimited" },
  { id: 3, name: "1 Year", description: "Most popular choice", subscriptionFee: "45", earnLimit: "Unlimited", isPopular: true },
  { id: 4, name: "2 Year Plan", description: "Maximum value for serious professionals", subscriptionFee: "65", earnLimit: "Unlimited" },
];

function PlanCard({ plan }) {
  return (
    <div
      style={{
        width: "18rem",
        minHeight: "24rem",
        borderRadius: "1rem",
        border: `2px solid ${plan.isPopular ? "#14b8a6" : "gray"}`,
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
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = "#56a8b3ff"; // yellow
        e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = "white";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
      }}
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
        <p style={{ color: "#4b5563", marginTop: "0.5rem", fontSize: "0.9rem" }}>Earn Limit: {plan.earnLimit}</p>
        <p style={{ marginTop: "1rem", fontSize: "1.5rem", color: "#065f46" }}>{plan.description}</p>
      </div>
      <button style={{
        marginTop: "1.5rem",
        width: "100%",
        backgroundColor: "#028090",
        color: "white",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        fontWeight: "600"
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor="#0addcbff"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor="#028090"}>
        Choose {plan.name}
      </button>
    </div>
  );
}

export default function Plans() {
  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "2rem",
    padding: "2rem"
  };

  const noteStyle = {
    marginTop: "3rem",
    backgroundColor: "#d2f3cdff",
    padding: "2rem",
    borderRadius: "1rem",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#000000ff",
    maxWidth: "900px",
    marginLeft: "auto",
    marginRight: "auto"
  };

  const bodyStyle = {
    minHeight: "100vh",
    fontFamily: "Merriweather, serif",
    backgroundImage: `
      radial-gradient(circle, #028090 5%, transparent 6%),
      `,
    backgroundSize: "50px 50px",
    paddingBottom: "4rem"
  };

  return (
    <div style={bodyStyle}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "center", marginTop: "2rem" ,position: "static", top: "0", background: "linear-gradient(#028090, #02C39A)", padding: "1rem 0" }}
      >Our Pricing Plans</h1>

      <div style={containerStyle}>
        {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      </div>

      <div style={noteStyle}>
        <p>* A contract is signed after subscription.</p>
        <p>* Account verification fee is a one-time payment across all plans (25 JD).</p>
      </div>
    </div>
  );
}
