import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProjectBasicInfo from "./ProjectBasicInfo";
import ProjectBudgetTimeline from "./ProjectBudgetTimeline";
import ProjectReview from "./ProjectReview";

const CreateProjectWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    sub_category_id: "",
    sub_sub_category_id: "",
    title: "",
    description: "",
    budget: "",
    duration_type: "days",
    duration_days: "",
    duration_hours: "",
    project_type: "fixed",
    budget_min: "",
    budget_max: "",
    hourly_rate: "",
    preferred_skills: []
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/category");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSuccess = (project) => {
    // Navigate based on project type
    if (project.project_type === "bidding") {
      navigate(`/projects/${project.id}`);
    } else if (["fixed", "hourly"].includes(project.project_type)) {
      navigate(`/payment/${project.id}`);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Budget & Timeline" },
    { number: 3, title: "Review" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep >= step.number
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded transition-all ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div>
          {currentStep === 1 && (
            <ProjectBasicInfo
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              categories={categories}
            />
          )}
          {currentStep === 2 && (
            <ProjectBudgetTimeline
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <ProjectReview
              formData={formData}
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProjectWizard;