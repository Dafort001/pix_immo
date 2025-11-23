import { Button } from '@/components/ui/button';
import { Check, AlertCircle, Lock } from 'lucide-react';
import type { OrderData, EditingOptions, Stack, Panorama } from '../UploadWorkflow';

interface StepReviewProps {
  orderData: OrderData;
  editingOptions: EditingOptions;
  stacks: Stack[];
  panoramas: Panorama[];
  isLocked: boolean;
  onLock: () => void;
}

export function StepReview({
  orderData,
  editingOptions,
  stacks,
  panoramas,
  isLocked,
  onLock,
}: StepReviewProps) {
  const selectedRetouches = [
    { key: 'removeOutlets', label: 'Steckdosen und sichtbare Kabel entfernen' },
    { key: 'removeBins', label: 'Mülleimer und Wäschekörbe entfernen' },
    { key: 'reducePersonalItems', label: 'Persönliche Gegenstände reduzieren' },
    { key: 'neutralizeTV', label: 'Fernseher neutralisieren' },
    { key: 'optimizeLawn', label: 'Rasen optimieren' },
    { key: 'addFireplace', label: 'Kaminfeuer einfügen' },
  ].filter((item) => editingOptions[item.key as keyof EditingOptions]);

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto pb-24">
        <div className="border-2 border-[#388E3C] rounded-lg p-8 text-center bg-[#F7F7F7]">
          <div className="w-16 h-16 bg-[#388E3C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="size-8 text-white" />
          </div>
          <h2 className="mb-3 text-2xl font-semibold">Auftrag gesperrt</h2>
          <p className="text-[#6F6F6F] mb-4">
            Der Auftrag befindet sich nun in der Bearbeitung.
            Weitere Änderungen sind nicht mehr möglich.
          </p>
          <div className="bg-white border border-[#C7C7C7] rounded-lg p-4 inline-block">
            <div className="text-[#6F6F6F] mb-1">Job-ID</div>
            <div className="text-xl font-semibold">{orderData.jobId}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 max-w-4xl">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Überprüfung</h2>
        <p className="text-[#6F6F6F] mb-6">
          Bitte prüfen Sie alle Angaben und Einstellungen.
          Nach der Bestätigung wird der Auftrag gesperrt.
        </p>
      </div>

      {/* Order Details */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Auftragsdetails</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Adresse</div>
            <div>{orderData.address}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Datum</div>
            <div>{orderData.date}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Job-ID</div>
            <div>{orderData.jobId}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Kunde</div>
            <div>{orderData.customer}</div>
          </div>
        </div>
      </div>

      {/* Files Summary */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Dateien</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Stapel</div>
            <div className="text-xl font-semibold">{stacks.length}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Gesamtdateien</div>
            <div className="text-xl font-semibold">
              {stacks.reduce((sum, stack) => sum + stack.files.length, 0)}
            </div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">360° Panoramen</div>
            <div className="text-xl font-semibold">{panoramas.length}</div>
          </div>
        </div>
      </div>

      {/* Editing Style */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Bearbeitungsstil</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#6F6F6F]">Bearbeitungsstil</span>
            <span className="font-medium">
              {orderData.editingStyle === 'styleA' && 'Stil A – Pix.immo Standard'}
              {orderData.editingStyle === 'styleB' && 'Stil B – Klar & kühl'}
              {orderData.editingStyle === 'styleC' && 'Stil C – Warm & soft'}
              {orderData.editingStyle === 'styleD' && 'Stil D – Magazin Plus'}
            </span>
          </div>
        </div>
      </div>

      {/* Retouches */}
      {selectedRetouches.length > 0 && (
        <div className="border border-[#C7C7C7] rounded-lg p-6">
          <h3 className="mb-4 text-xl font-semibold">Ausgewählte Retuschen</h3>
          
          <div className="space-y-2">
            {selectedRetouches.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Check className="size-4 text-[#388E3C]" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {editingOptions.additionalNotes && (
        <div className="border border-[#C7C7C7] rounded-lg p-6">
          <h3 className="mb-4 text-xl font-semibold">Zusätzliche Wünsche</h3>
          <div className="bg-[#F7F7F7] p-4 rounded border border-[#E6E6E6] whitespace-pre-wrap">
            {editingOptions.additionalNotes}
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      <div className="border-2 border-[#FBC02D] bg-[#FFFBF0] rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="size-6 text-[#FBC02D] flex-shrink-0" />
          <div>
            <h3 className="mb-2 font-semibold">Wichtiger Hinweis</h3>
            <p className="text-[#6F6F6F]">
              Nach der Bestätigung wird der Auftrag gesperrt und kann nicht mehr bearbeitet werden.
              Bitte stellen Sie sicher, dass alle Angaben korrekt sind.
            </p>
          </div>
        </div>
      </div>

      {/* Lock Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onLock}
          size="lg"
          className="bg-black text-white hover:bg-[#111111] px-12"
          data-testid="button-lock-order"
        >
          <Lock className="size-5 mr-2" />
          Auftrag bestätigen und sperren
        </Button>
      </div>
    </div>
  );
}
