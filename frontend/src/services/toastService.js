import { toast } from 'react-toastify';

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Success toast
export const toastSuccess = (message) => {
  toast.success(message, toastConfig);
};

// Error toast
export const toastError = (message) => {
  toast.error(message, toastConfig);
};

// Info toast
export const toastInfo = (message) => {
  toast.info(message, toastConfig);
};

// Warning toast
export const toastWarning = (message) => {
  toast.warn(message, toastConfig);
};

// Custom toast with options
export const toastCustom = (message, type = 'info', options = {}) => {
  const finalConfig = { ...toastConfig, ...options };
  toast[type](message, finalConfig);
};

// Toast for form validation errors
export const toastValidationError = (message) => {
  toast.error(message, { ...toastConfig, autoClose: 7000 });
};

// Toast for API responses
export const toastApiResponse = (response, successMessage = 'Operation completed successfully') => {
  if (response?.status >= 200 && response?.status < 300) {
    toastSuccess(successMessage);
  } else {
    toastError(response?.data?.message || 'Operation failed');
  }
};
