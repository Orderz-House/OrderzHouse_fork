export const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div
      className="flex-shrink-0 h-full"
      style={{ width: "220px", minWidth: "180px" }}
    >
      <div className="h-full flex flex-col justify-start">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-gradient-to-r from-[#00A896] to-[#02C39A] text-white shadow-lg"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      currentStep >= step.id ? "text-[#00A896]" : "text-gray-500"
                    }`}
                  >
                    Step {step.id}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-[#00A896]" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-12 transition-colors ${
                    currentStep > step.id
                      ? "bg-gradient-to-b from-[#00A896] to-[#02C39A]"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};