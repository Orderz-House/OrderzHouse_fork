import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastProvider";
import BiddingProjectForm from "../../components/CreateProjects/shared/BiddingProjectForm";
import API from "../../api/client.js";

export default function CreateTender() {
  const { userData, token } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const toast = useToast();
  const [projectData, setProjectData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check permission
  React.useEffect(() => {
    if (userData?.role_id !== 2 || !userData?.can_manage_tender_vault) {
      toast.error("Access denied. You do not have permission to manage tender vault.");
      navigate("/client/tender-vault");
    }
  }, [userData, navigate, toast]);

  const handleSubmit = async (formData) => {
    if (!token) {
      toast.error("You must be logged in", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await API.post("/tender-vault/projects", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        toast.success("Tender created successfully and stored in vault", "success");
        navigate("/client/tender-vault", { replace: true });
      } else {
        throw new Error(res.data?.message || "Failed to create tender");
      }
    } catch (err) {
      console.error("Failed to create tender:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to create tender";
      
      // Check for schema mismatch error
      if (errorMessage.includes("schema mismatch") || errorMessage.includes("migration")) {
        toast.error("Tender Vault database not migrated. Please run migrations.", "error");
      } else {
        toast.error(errorMessage, "error");
      }
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28">
      <div className="max-w-5xl mx-auto px-4 py-12 -mt-2 relative z-10">
        <BiddingProjectForm
          projectData={projectData}
          setProjectData={setProjectData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/client/tender-vault")}
          isSubmitting={isSubmitting}
          title="Create New Tender"
          submitLabel="Create Tender"
          showCancel={true}
        />
      </div>
    </div>
  );
}
