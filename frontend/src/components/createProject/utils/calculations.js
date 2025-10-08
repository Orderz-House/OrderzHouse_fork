export const calculatePaymentAmount = (form) => {
  if (form.project_type === "fixed") return parseFloat(form.budget) || 0;
  if (form.project_type === "hourly")
    return (parseFloat(form.hourly_rate) || 0) * 3;
  if (form.project_type === "bidding")
    return parseFloat(form.budget_max) || 0;
  return 0;
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const prepareProjectPayload = (form) => {
  const payload = { ...form };

  if (form.project_type === "fixed") {
    payload.budget_min = null;
    payload.budget_max = null;
    payload.hourly_rate = null;
  } else if (form.project_type === "bidding") {
    payload.budget = null;
    payload.hourly_rate = null;
  } else if (form.project_type === "hourly") {
    payload.budget = null;
    payload.budget_min = null;
    payload.budget_max = null;
    payload.duration_days = null;
    payload.duration_hours = null;
  }

  return payload;
};