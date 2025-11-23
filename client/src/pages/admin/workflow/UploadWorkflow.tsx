import { useState, useEffect } from 'react';
import { StepIndicator } from './StepIndicator';
import { OrderHeader } from './OrderHeader';
import { StepUpload } from './steps/StepUpload';
import { StepStacks } from './steps/StepStacks';
import { StepEditing } from './steps/StepEditing';
import { StepReview } from './steps/StepReview';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  fileId: string;
  name: string;
  category: string;
  floor: string;
  connections: string[];
}

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Stapel & Raumtypen' },
  { id: 3, label: 'Editing-Optionen' },
  { id: 4, label: 'Überprüfung' },
];

interface UploadWorkflowProps {
  jobId: string;
}

export function UploadWorkflow({ jobId }: UploadWorkflowProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [unsortedFiles, setUnsortedFiles] = useState<UploadFile[]>([]);
  
  // Fetch job data
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['/api/jobs', jobId],
  });

  const [orderData, setOrderData] = useState<OrderData>({
    address: '',
    date: '',
    jobId: '',
    customer: '',
    editingStyle: 'styleA',
    windowStyle: 'neutral',
    skyStyle: 'none',
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

  // Initialize order data from job
  useEffect(() => {
    if (job) {
      setOrderData({
        address: job.propertyAddress || job.addressFormatted || '',
        date: job.appointmentDate ? new Date(job.appointmentDate).toLocaleDateString('de-DE') : '',
        jobId: job.jobNumber || '',
        customer: job.customerName || '',
        editingStyle: job.editingStyle || 'styleA',
        windowStyle: job.windowStyle || 'neutral',
        skyStyle: job.skyStyle || 'none',
        createAltTexts: job.deliverAlttext === 'true',
        createCaptions: job.deliverExpose === 'true',
      });

      if (job.tour360) {
        setEnable360Tour(true);
        // Parse tour360 JSON if available
      }

      if (job.retouchProfile) {
        setEditingOptions({
          ...editingOptions,
          ...job.retouchProfile,
        });
      }

      if (job.customerCommentDe) {
        setEditingOptions(prev => ({
          ...prev,
          additionalNotes: job.customerCommentDe,
        }));
      }
    }
  }, [job]);

  // Fetch stacks for job
  const { data: stacksData } = useQuery({
    queryKey: ['/api/jobs', jobId, 'workflow', 'stacks'],
    enabled: currentStep >= 2,
  });

  useEffect(() => {
    if (stacksData?.stacks) {
      // Convert backend stacks to frontend format
      setStacks(stacksData.stacks.map((s: any) => ({
        id: s.id,
        files: (s.images || []).map((img: any) => ({
          id: img.id,
          name: img.originalFilename,
          size: img.fileSize,
          type: img.mimeType,
          url: img.thumbnailUrl,
          timestamp: new Date(),
          width: 0,
          height: 0,
          is360: img.type === '360',
        })),
        roomType: s.roomType || '',
        stackType: 
          s.frameCount === 3 ? 'bracket3' : 
          s.frameCount === 5 ? 'bracket5' : 
          (s.images?.[0]?.type === 'video' ? 'video' : 
          (s.images?.[0]?.type === '360' ? 'pano360' : 'single')),
        comment: s.comment || '',
      })));
    }

    if (stacksData?.unsortedImages) {
      // Convert unsorted images to frontend format
      setUnsortedFiles(stacksData.unsortedImages.map((img: any) => ({
        id: img.id,
        name: img.originalFilename,
        size: img.fileSize,
        type: img.mimeType,
        url: img.thumbnailUrl,
        timestamp: new Date(),
        width: 0,
        height: 0,
        is360: img.type === '360',
      })));
    }
  }, [stacksData]);

  const isLocked = job?.workflowLocked || false;

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest(`/api/jobs/${jobId}/workflow`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', jobId] });
      toast({
        title: 'Gespeichert',
        description: 'Änderungen wurden gespeichert.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Speichern fehlgeschlagen',
        variant: 'destructive',
      });
    },
  });

  const canProceed = () => {
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

  const handleLockOrder = async () => {
    // Validate all stacks have room types
    const invalidStacks = stacks.filter(s => !s.roomType);
    if (invalidStacks.length > 0) {
      toast({
        title: 'Fehlende Raumtypen',
        description: `Bitte weisen Sie allen ${invalidStacks.length} Stapeln einen Raumtyp zu.`,
        variant: 'destructive',
      });
      setCurrentStep(2); // Go back to stacks step
      return;
    }

    // Save all data and lock
    const updates = {
      editingStyle: orderData.editingStyle === 'styleA' ? 'A' : 
                    orderData.editingStyle === 'styleB' ? 'B' :
                    orderData.editingStyle === 'styleC' ? 'C' : 'D',
      windowStyle: orderData.windowStyle,
      skyStyle: orderData.skyStyle,
      retouchProfile: editingOptions,
      customerCommentDe: editingOptions.additionalNotes,
      tour360: enable360Tour ? { panoramas, floorplan, startPanorama } : null,
      workflowLocked: true,
    };

    try {
      await updateJobMutation.mutateAsync(updates);
      toast({
        title: 'Auftrag gesperrt',
        description: 'Der Workflow wurde erfolgreich gesperrt und befindet sich nun in Bearbeitung.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Auftrag konnte nicht gesperrt werden.',
        variant: 'destructive',
      });
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep && !isLocked) {
      setCurrentStep(stepId);
    } else if (stepId === currentStep) {
      return;
    } else if (stepId === currentStep + 1 && canProceed()) {
      setCurrentStep(stepId);
    }
  };

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-xl">Lädt...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <OrderHeader orderData={orderData} isLocked={isLocked} />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          isLocked={isLocked}
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
              jobId={jobId}
              isLocked={isLocked}
            />
          )}

          {currentStep === 2 && (
            <StepStacks
              stacks={stacks}
              setStacks={setStacks}
              unsortedFiles={unsortedFiles}
              isLocked={isLocked}
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
              isLocked={isLocked}
            />
          )}

          {currentStep === 4 && (
            <StepReview
              orderData={orderData}
              editingOptions={editingOptions}
              stacks={stacks}
              panoramas={panoramas}
              isLocked={isLocked}
              onLock={handleLockOrder}
            />
          )}
        </div>

        {/* Navigation Footer */}
        {!isLocked && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#C7C7C7] py-4 px-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-[#C7C7C7]"
                data-testid="button-workflow-back"
              >
                <ChevronLeft className="size-4 mr-2" />
                Zurück
              </Button>

              {currentStep < STEPS.length && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-black text-white hover:bg-[#111111]"
                  data-testid="button-workflow-next"
                >
                  Weiter
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
