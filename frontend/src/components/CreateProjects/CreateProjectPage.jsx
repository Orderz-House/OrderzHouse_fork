import React, { useState } from "react";
import ProjectDetailsStep from "./steps/ProjectDetailsStep";
import ProjectFilesStep from "./steps/ProjectFilesStep";
import AssignFreelancersStep from "./steps/AssignFreelancersStep";
import PaymentStep from "./steps/PaymentStep";
import { createProjectDraftApi } from "./api/projects"; 

export default function CreateProjectPage() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({});
  const [projectId, setProjectId] = useState(null); 
  const [files, setFiles] = useState([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Handle Step 1: create draft
  const handleNextFromDetails = async (formData) => {
    try {
      const res = await createProjectDraftApi(formData);
      setProjectId(res.id);       
      setProjectData(formData);  
      nextStep();
    } catch (err) {
      alert(err.message || "Failed to create project");
    }
  };

  const steps = [
    { number: 1, label: "Details" },
    { number: 2, label: "Files" },
    { number: 3, label: "Freelancer" },
    { number: 4, label: "Payment" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600">Follow the steps below to create your project</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1 relative">
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${
                    step >= s.number 
                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                      : 'bg-white text-gray-400 border-2 border-gray-300'
                  }`}>
                    {step > s.number ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s.number}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    step >= s.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                    step > s.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="transition-all duration-300 ease-in-out">
          {step === 1 && (
            <ProjectDetailsStep
              onNext={handleNextFromDetails} 
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
              projectId={projectId} 
            />
          )}
          {step === 3 && (
            <AssignFreelancersStep
              onNext={nextStep}
              onBack={prevStep}
              categoryId={projectData.category_id}
              projectId={projectId} 
              selectedFreelancer={selectedFreelancer}
              setSelectedFreelancer={setSelectedFreelancer}
            />
          )}
          {step === 4 && (
            <PaymentStep
              onBack={prevStep}
              projectId={projectId} 
              files={files}
              selectedFreelancer={selectedFreelancer}
            />
          )}
        </div>
      </div>
    </div>
  );
}
