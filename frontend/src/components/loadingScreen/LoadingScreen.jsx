export default function LoadingScreen({ text = "Loading…" }) {
  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <div className="loader" />
        <div style={labelStyle}>{text}</div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,1)",
  backdropFilter: "blur(2px)",
};

const boxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const labelStyle = {
  marginTop: 12,
  color: "#475569",
  fontSize: 14,
};
