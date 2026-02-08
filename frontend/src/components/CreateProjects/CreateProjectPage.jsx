// CreateProjectPage.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastProvider";

import ProjectDetailsStep from "./steps/ProjectDetailsStep";
import ProjectFilesStep from "./steps/ProjectFilesStep";
import PaymentStep from "./steps/PaymentStep";
import ProjectCoverStep from "./steps/ProjectCoverStep";
import DevelopmentNoticeModal from "./steps/popUp";

import {
  createProjectApi,
  uploadProjectFilesApi,
  createProjectCheckoutSessionApi,
} from "./api/projects";

const DEVELOPMENT_CATEGORY_ID = 3;

export default function CreateProjectPage() {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [coverPic, setCoverPic] = useState(null);
  const [projectData, setProjectData] = useState({});
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDevPopup, setShowDevPopup] = useState(false);

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  const handleFinalSubmit = async () => {
    if (!token) {
      showToast("You must be logged in", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // ============================
      // 1️⃣ BIDDING PROJECT → CREATE IMMEDIATELY
      // ============================
      if (projectData.project_type === "bidding") {
        const project = await createProjectApi(projectData, token);
        const projectId = project.id;

        if (files.length > 0) {
          await uploadProjectFilesApi(projectId, files, token);
        }

        showToast(
          "Project submitted successfully and is waiting for admin approval",
          "success"
        );

        navigate("/", { replace: true });
        return;
      }

      // ============================
      // 2️⃣ PAID PROJECT → STRIPE FIRST (or skip if permission granted)
      // ============================
      const response = await createProjectCheckoutSessionApi(
        projectData,
        token
      );

      // Check if payment was skipped
      if (response.skipPayment === true) {
        const projectId = response.project_id;

        // Upload files if any
        if (files.length > 0) {
          await uploadProjectFilesApi(projectId, files, token);
        }

        showToast("Project posted successfully", "success");
        navigate("/client", { replace: true });
        return;
      }

      // Normal flow: redirect to Stripe
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No payment URL or skipPayment flag in response");
      }

    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Failed to proceed",
        "error"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28">
    
      <div className="max-w-5xl mx-auto px-4 py-12 -mt-2 relative z-10">

        {step === 1 && (
          <ProjectDetailsStep
            projectData={projectData}
            setProjectData={setProjectData}
            onNext={() => {
              if (Number(projectData.category_id) === DEVELOPMENT_CATEGORY_ID) {
                setShowDevPopup(true);
              } else {
                nextStep();
              }
            }}
          />
        )}

        {step === 2 && (
          <ProjectCoverStep
            coverPic={coverPic}
            setCoverPic={setCoverPic}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <ProjectFilesStep
            files={files}
            setFiles={setFiles}
            onNext={() => {
              if (projectData.project_type === "bidding") {
                handleFinalSubmit();
              } else {
                nextStep();
              }
            }}
            onBack={prevStep}
          />
        )}

        {step === 4 && projectData.project_type !== "bidding" && (
          <PaymentStep
            projectData={projectData}
            onBack={prevStep}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}

      </div>

      {showDevPopup && (
        <DevelopmentNoticeModal
          onClose={() => setShowDevPopup(false)}
          onConfirm={() => {
            setShowDevPopup(false);
            nextStep();
          }}
        />
      )}
    </div>
  );
}
