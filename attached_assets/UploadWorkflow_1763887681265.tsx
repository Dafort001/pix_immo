import React, { useState } from 'react';
import { StepIndicator } from './StepIndicator';
import { OrderHeader } from './OrderHeader';
import { StepUpload } from './steps/StepUpload';
import { StepStacks } from './steps/StepStacks';
import { StepEditing } from './steps/StepEditing';
import { StepReview } from './steps/StepReview';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  timestamp: Date;
  width?: number;
  height?: number;
  is360?: boolean;
}

export interface Stack {
  id: string;
  files: UploadFile[];
  roomType: string;
  stackType: 'single' | 'bracket3' | 'bracket5' | 'video' | 'pano360';
  comment?: string;
  altText?: string;
  caption?: string;
}

export interface OrderData {
  address: string;
  date: string;
  jobId: string;
  customer: string;
  editingStyle: string;
  windowStyle: string;
  skyStyle: string;
  createAltTexts?: boolean;
  createCaptions?: boolean;
}

export interface EditingOptions {
  removeOutlets: boolean;
  removeBins: boolean;
  reducePersonalItems: boolean;
  neutralizeTV: boolean;
  optimizeLawn: boolean;
  addFireplace: boolean;
  additionalNotes: string;
}

export interface Panorama {
  id: string;
  url: string;
  timestamp: Date;
  width: number;
  height: number;
}

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Stapel & Raumtypen' },
  { id: 3, label: 'Editing-Optionen' },
  { id: 4, label: 'Überprüfung' },
];

export function UploadWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [unsortedFiles, setUnsortedFiles] = useState<UploadFile[]>([]);
  
  const [orderData, setOrderData] = useState<OrderData>({
    address: 'Musterstraße 123, 10115 Berlin',
    date: '22.11.2025',
    jobId: 'JOB-2025-1147',
    customer: 'Immobilien Müller GmbH',
    editingStyle: 'styleA',
    windowStyle: 'Clear View',
    skyStyle: 'Himmel B',
  });

  const [editingOptions, setEditingOptions] = useState<EditingOptions>({
    removeOutlets: false,
    removeBins: false,
    reducePersonalItems: false,
    neutralizeTV: false,
    optimizeLawn: false,
    addFireplace: false,
    additionalNotes: '',
  });

  const [enable360Tour, setEnable360Tour] = useState(false);
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [floorplan, setFloorplan] = useState<string | null>(null);
  const [startPanorama, setStartPanorama] = useState<string | null>(null);

  const canProceed = () => {
    // Allow proceeding through all steps for demo purposes
    // so customers can see what needs to be done
    return !isLocked;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && !isLocked) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLockOrder = () => {
    setIsLocked(true);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep && !isLocked) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OrderHeader
        orderData={orderData}
        currentStep={currentStep}
        totalSteps={STEPS.length}
      />

      <div className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-8">
        <div className="max-w-6xl mx-auto">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          <div className="mt-8">
            {currentStep === 1 && (
              <StepUpload
                files={files}
                setFiles={setFiles}
                stacks={stacks}
                setStacks={setStacks}
                unsortedFiles={unsortedFiles}
                setUnsortedFiles={setUnsortedFiles}
              />
            )}
            
            {currentStep === 2 && (
              <StepStacks
                stacks={stacks}
                setStacks={setStacks}
              />
            )}
            
            {currentStep === 3 && (
              <StepEditing
                orderData={orderData}
                setOrderData={setOrderData}
                editingOptions={editingOptions}
                setEditingOptions={setEditingOptions}
                stacks={stacks}
                setStacks={setStacks}
                files={files}
                enable360Tour={enable360Tour}
                setEnable360Tour={setEnable360Tour}
                panoramas={panoramas}
                setPanoramas={setPanoramas}
                floorplan={floorplan}
                setFloorplan={setFloorplan}
                startPanorama={startPanorama}
                setStartPanorama={setStartPanorama}
              />
            )}
            
            {currentStep === 4 && (
              <StepReview
                orderData={orderData}
                editingOptions={editingOptions}
                stacks={stacks}
                panoramas={enable360Tour ? panoramas : []}
                isLocked={isLocked}
                onLock={handleLockOrder}
              />
            )}
          </div>
        </div>
      </div>

      {!isLocked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#C7C7C7] py-4">
          <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-black text-black hover:bg-[#F7F7F7]"
            >
              <ChevronLeft className="size-4 mr-2" />
              Zurück
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-black text-white hover:bg-[#111111]"
              >
                Weiter
                <ChevronRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleLockOrder}
                disabled={isLocked || !canProceed()}
                className="bg-black text-white hover:bg-[#111111]"
              >
                Auftrag bestätigen und sperren
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}