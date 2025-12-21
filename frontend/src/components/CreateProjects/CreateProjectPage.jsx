import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastProvider";

import ProjectDetailsStep from "./steps/ProjectDetailsStep";
import ProjectFilesStep from "./steps/ProjectFilesStep";
import PaymentStep from "./steps/PaymentStep";

import {
  createProjectApi,
  uploadProjectFilesApi,
  createProjectCheckoutSessionApi,
} from "./api/projects";

export default function CreateProjectPage() {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({});
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  const handleFinalSubmit = async () => {
    if (!token) {
      showToast("You must be logged in", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Create project (status depends on type)
      const project = await createProjectApi(projectData, token);
      const projectId = project.id;

      // 2️⃣ Upload files (optional)
      if (files.length > 0) {
        await uploadProjectFilesApi(projectId, files, token);
      }

      // 3️⃣ BIDDING → NO PAYMENT
      if (project.project_type === "bidding") {
        showToast(
          "Project submitted successfully and is waiting for admin approval",
          "success"
        );
        navigate("/", { replace: true });
        return;
      }

      // 4️⃣ FIXED / HOURLY → STRIPE PAYMENT
      const { url } = await createProjectCheckoutSessionApi(projectId, token);
      window.location.href = url;

    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Failed to create project",
        "error"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4">

        {step === 1 && (
          <ProjectDetailsStep
            onNext={nextStep}
            projectData={projectData}
            setProjectData={setProjectData}
          />
        )}

        {step === 2 && (
          <ProjectFilesStep
            files={files}
            setFiles={setFiles}
            onNext={() => {
              // 🚀 Skip payment for bidding
              if (projectData.project_type === "bidding") {
                handleFinalSubmit();
              } else {
                nextStep();
              }
            }}
            onBack={prevStep}
          />
        )}

        {step === 3 && projectData.project_type !== "bidding" && (
          <PaymentStep
            projectData={projectData}
            onBack={prevStep}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}

      </div>
    </div>
  );
}
