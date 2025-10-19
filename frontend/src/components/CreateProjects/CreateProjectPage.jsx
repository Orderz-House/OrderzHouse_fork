import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ProjectDetailsStep from "./steps/ProjectDetailsStep";
import ProjectFilesStep from "./steps/ProjectFilesStep";
import AssignFreelancersStep from "./steps/AssignFreelancersStep";
import PaymentStep from "./steps/PaymentStep";

import {
  createProjectApi,
  uploadProjectFilesApi,
  assignFreelancerApi,
  recordOfflinePaymentApi
} from "./api/projects";

const THEME = "#028090";

export default function CreateProjectPage() {
  const token = useSelector(state => state.auth.token);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({});
  const [files, setFiles] = useState([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinalSubmit = async () => {
    if (!token) return alert("You must be logged in to create a project");

    setIsSubmitting(true);
    try {
      const createdProject = await createProjectApi(
        { ...projectData, freelancer_id: selectedFreelancer?.id }, token
      );
      const projectId = createdProject.id;

      if (files.length > 0) await uploadProjectFilesApi(projectId, files, token);
      if (selectedFreelancer) await assignFreelancerApi(projectId, selectedFreelancer.id, token);

      if (proofFile) {
        let amount = 0;
        if (projectData.project_type === "fixed") amount = Number(projectData.budget);
        else if (projectData.project_type === "hourly") amount = Number(projectData.hourly_rate);
        else if (projectData.project_type === "bidding") amount = Number(projectData.budget_max);

        if (!isNaN(amount) && amount > 0) {
          await recordOfflinePaymentApi(projectId, proofFile, token, amount);
        } else {
          alert("Invalid payment amount. Cannot submit payment proof.");
        }
      }

      alert("Project created successfully!");
      navigate("/");
    } catch (err) {
      alert(err.message || "Failed to create project");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Details" },
    { number: 2, label: "Files" },
    { number: 3, label: "Freelancer" },
    { number: 4, label: "Payment" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Create New Project
          </h1>
          <p className="text-slate-500 mt-2">Follow the steps below to create your project</p>
        </div>

        {/* Progress */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="relative">
            <div className="absolute left-4 right-4 top-[28px] h-1 bg-slate-100 rounded-full" />
            <div
              className="absolute left-4 top-[28px] h-1 rounded-full transition-all"
              style={{
                width: `calc(${((step - 1) / 3) * 100}% + 0.5rem)`,
                background: "linear-gradient(90deg,#02C39A, #028090 60%, #05668D)"
              }}
            />
            <div className="relative grid grid-cols-4 gap-2">
              {steps.map((s) => {
                const active = step >= s.number;
                const done = step > s.number;
                return (
                  <div key={s.number} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-full grid place-items-center font-bold ring-2 transition-all ${
                        active ? "text-white" : "bg-white text-slate-500 ring-slate-200"
                      }`}
                      style={{
                        background: active ? "linear-gradient(135deg,#02C39A,#028090)" : undefined,
                        boxShadow: active ? "0 10px 24px -10px rgba(2,128,144,.45)" : undefined
                      }}
                    >
                      {done ? (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : s.number}
                    </div>
                    <span className={`mt-2 text-sm font-semibold ${active ? "text-[#028090]" : "text-slate-500"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="transition-all duration-300">
          {step === 1 && (
            <ProjectDetailsStep
              onNext={nextStep}
              projectData={projectData}
              setProjectData={setProjectData}
            />
          )}
          {step === 2 && (
            <ProjectFilesStep
              onNext={nextStep}
              onBack={prevStep}
              files={files}
              setFiles={setFiles}
            />
          )}
          {step === 3 && (
            <AssignFreelancersStep
              onNext={nextStep}
              onBack={prevStep}
              categoryId={projectData.category_id}
              selectedFreelancer={selectedFreelancer}
              setSelectedFreelancer={setSelectedFreelancer}
            />
          )}
          {step === 4 && (
            <PaymentStep
              onBack={prevStep}
              files={files}
              projectData={projectData}
              selectedFreelancer={selectedFreelancer}
              proofFile={proofFile}
              setProofFile={setProofFile}
              isSubmitting={isSubmitting}
              onSubmit={handleFinalSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}