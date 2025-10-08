export const validateStep0 = (form) => {
  return form.project_type && form.assignment_type;
};

export const validateStep1 = (form) => {
  const requiredFields = ["category_id", "title", "description"];

  if (!requiredFields.every((field) => form[field]?.toString().trim()))
    return false;

  if (form.project_type === "fixed" && (!form.budget || form.budget <= 0))
    return false;

  if (
    form.project_type === "bidding" &&
    (!form.budget_min ||
      !form.budget_max ||
      form.budget_min <= 0 ||
      form.budget_max <= 0)
  )
    return false;

  if (
    form.project_type === "hourly" &&
    (!form.hourly_rate || form.hourly_rate <= 0)
  )
    return false;

  if (form.project_type !== "hourly") {
    if (
      form.duration_type === "days" &&
      (!form.duration_days || form.duration_days <= 0)
    )
      return false;
    if (
      form.duration_type === "hours" &&
      (!form.duration_hours || form.duration_hours <= 0)
    )
      return false;
  }

  return true;
};

export const validateBudgetRange = (form) => {
  if (form.project_type === "bidding" && form.budget_min && form.budget_max) {
    return parseFloat(form.budget_max) > parseFloat(form.budget_min);
  }
  return true;
};

export const validatePaymentFile = (file) => {
  if (!file) return { valid: false, error: "Please select a file" };

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload only JPG, PNG, or PDF files",
    };
  }

  return { valid: true };
};