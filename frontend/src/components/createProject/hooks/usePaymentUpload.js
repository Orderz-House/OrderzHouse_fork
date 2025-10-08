import { useState } from "react";
import axios from "axios";
import { toastError, toastSuccess } from "../../../services/toastService";
import { validatePaymentFile } from "../utils/validation";
import { API_BASE } from "../constants";

export const usePaymentUpload = (token) => {
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);

  const handlePaymentFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validatePaymentFile(file);
    if (!validation.valid) {
      toastError(validation.error);
      return;
    }

    setPaymentFile(file);
  };

  const uploadPaymentProof = async (projectId, amount) => {
    if (!paymentFile) {
      toastError("Please select a payment proof file");
      return false;
    }

    setUploadingPayment(true);
    const formData = new FormData();
    formData.append("proof", paymentFile);
    formData.append("amount", amount);

    try {
      await axios.post(
        `${API_BASE}/payments/offline/record/${projectId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toastSuccess(
        "Payment proof uploaded successfully! We'll review it within 24 hours."
      );
      return true;
    } catch (error) {
      console.error("Payment upload error:", error);
      toastError(
        error.response?.data?.message || "Failed to upload payment proof"
      );
      return false;
    } finally {
      setUploadingPayment(false);
    }
  };

  return {
    paymentFile,
    uploadingPayment,
    handlePaymentFileSelect,
    uploadPaymentProof,
    setPaymentFile,
  };
};