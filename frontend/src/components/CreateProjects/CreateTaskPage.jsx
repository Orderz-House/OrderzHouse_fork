import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastProvider";

import ProjectDetailsStep from "./steps/ProjectDetailsStep";
import ProjectCoverStep from "./steps/ProjectCoverStep";
import ProjectFilesStep from "./steps/ProjectFilesStep";
import PaymentStep from "./steps/PaymentStep";

import { createTaskApi, uploadTaskFilesApi } from "./api/tasks"; // عدّل المسار حسب مشروعك

const THEME = "#028090";

export default function CreateTaskPage() {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [taskData, setTaskData] = useState({});
  const [coverPic, setCoverPic] = useState(null);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFinalSubmit = async () => {
    if (!token) {
      showToast("You must be logged in to create a task", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // نبني FormData للـ task (مثل المشاريع)
      const formData = new FormData();
      const payload = {
        ...taskData,
        project_type: "fixed", // النوع الوحيد للـ tasks
      };

      for (const [key, value] of Object.entries(payload)) {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, v));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      }

      if (coverPic) formData.append("cover_pic", coverPic);

      // 1) إنشاء التاسك
      const createdTask = await createTaskApi(formData, token);
      const taskId = createdTask.id;

      // 2) رفع الملفات (اختياري)
      if (files.length > 0) {
        try {
          await uploadTaskFilesApi(taskId, files, token);
        } catch {
          showToast(
            "Task created but file upload failed. You can upload them later.",
            "warning"
          );
        }
      }

      showToast("Task created successfully!", "success");
      navigate("/freelancer/tasks"); // عدّل المسار لو عندك صفحة أخرى لقائمة التاسكات
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create task";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Details" },
    { number: 2, label: "Cover" },
    { number: 3, label: "Files" },
    { number: 4, label: "Preview" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Create New Task
          </h1>
          <p className="text-slate-500 mt-2">
            Follow the steps below to create your task
          </p>
        </div>

        {/* Progress (نفس اللي في صفحة البروجكت تقريبًا) */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="relative">
            <div className="absolute left-4 right-4 top-[28px] h-1 bg-slate-100 rounded-full" />
            <div
              className="absolute left-4 top-[28px] h-1 rounded-full transition-all"
              style={{
                width: `calc(${((step - 1) / 3) * 100}% + 0.5rem)`,
                background:
                  "linear-gradient(90deg,#02C39A, #028090 60%, #05668D)",
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
                        active
                          ? "text-white"
                          : "bg-white text-slate-500 ring-slate-200"
                      }`}
                      style={{
                        background: active
                          ? "linear-gradient(135deg,#02C39A,#028090)"
                          : undefined,
                        boxShadow: active
                          ? "0 10px 24px -10px rgba(2,128,144,.45)"
                          : undefined,
                      }}
                    >
                      {done ? (
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        s.number
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-semibold ${
                        active ? "text-[#028090]" : "text-slate-500"
                      }`}
                    >
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
              projectData={taskData}
              setProjectData={setTaskData}
              isTask={true}
            />
          )}

          {step === 2 && (
            <ProjectCoverStep
              coverPic={coverPic}
              setCoverPic={setCoverPic}
              onNext={nextStep}
              onBack={prevStep}
              isTask={true}
            />
          )}

          {step === 3 && (
            <ProjectFilesStep
              onNext={nextStep}
              onBack={prevStep}
              files={files}
              setFiles={setFiles}
              isTask={true}
            />
          )}

          {step === 4 && (
            <PaymentStep
              onBack={prevStep}
              files={files}
              projectData={taskData}
              selectedFreelancer={null}
              proofFile={null}
              setProofFile={() => {}}
              isSubmitting={isSubmitting}
              onSubmit={handleFinalSubmit}
              isTask={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
