import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  isLocked?: boolean;
  onStepClick?: (stepId: number) => void;
}

export function StepIndicator({ steps, currentStep, isLocked, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-initial">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => onStepClick?.(step.id)}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                step.id < currentStep
                  ? 'bg-black border-black text-white'
                  : step.id === currentStep
                  ? 'border-black text-black bg-white'
                  : 'border-[#C7C7C7] text-[#C7C7C7] bg-white'
              }`}
            >
              {step.id < currentStep ? (
                <Check className="size-5" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <div className="ml-3">
              <div
                className={`text-sm font-medium ${
                  step.id === currentStep
                    ? 'text-black'
                    : step.id < currentStep
                    ? 'text-[#6F6F6F]'
                    : 'text-[#C7C7C7]'
                }`}
              >
                {step.label}
              </div>
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${
                step.id < currentStep ? 'bg-black' : 'bg-[#C7C7C7]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
