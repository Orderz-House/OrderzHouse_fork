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
      // 2️⃣ PAID PROJECT → STRIPE FIRST
      // ============================
      const { url } = await createProjectCheckoutSessionApi(
        projectData,
        token
      );

      window.location.href = url;

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
    <div className="min-h-screen bg-slate-50 py-12 pt-28">
      <div className="max-w-5xl mx-auto px-4">

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
