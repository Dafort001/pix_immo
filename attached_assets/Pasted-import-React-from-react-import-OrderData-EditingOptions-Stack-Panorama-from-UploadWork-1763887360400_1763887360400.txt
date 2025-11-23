import React from 'react';
import { OrderData, EditingOptions, Stack, Panorama } from '../UploadWorkflow';
import { Button } from '../ui/button';
import { Check, AlertCircle, Lock } from 'lucide-react';

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
  ].filter(item => editingOptions[item.key as keyof EditingOptions]);

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto pb-24">
        <div className="border-2 border-[#388E3C] rounded-lg p-8 text-center bg-[#F7F7F7]">
          <div className="w-16 h-16 bg-[#388E3C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="size-8 text-white" />
          </div>
          <h2 className="mb-3">Auftrag gesperrt</h2>
          <p className="text-[#6F6F6F] mb-4">
            Der Auftrag befindet sich nun in der Bearbeitung.
            Weitere Änderungen sind nicht mehr möglich.
          </p>
          <div className="bg-white border border-[#C7C7C7] rounded-lg p-4 inline-block">
            <div className="text-[#6F6F6F] mb-1">Job-ID</div>
            <div className="text-xl">{orderData.jobId}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 max-w-4xl">
      <div>
        <h2 className="mb-2">Überprüfung</h2>
        <p className="text-[#6F6F6F] mb-6">
          Bitte prüfen Sie alle Angaben und Einstellungen.
          Nach der Bestätigung wird der Auftrag gesperrt.
        </p>
      </div>

      {/* Order Details */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4">Auftragsdetails</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[#6F6F6F] mb-1">Adresse</div>
            <div>{orderData.address}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1">Datum</div>
            <div>{orderData.date}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1">Job-ID</div>
            <div>{orderData.jobId}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1">Kunde</div>
            <div>{orderData.customer}</div>
          </div>
        </div>
      </div>

      {/* Files Summary */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4">Dateien</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[#6F6F6F] mb-1">Stapel</div>
            <div className="text-xl">{stacks.length}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1">Gesamtdateien</div>
            <div className="text-xl">
              {stacks.reduce((sum, stack) => sum + stack.files.length, 0)}
            </div>
          </div>
          <div>
            <div className="text-[#6F6F6F] mb-1">360° Panoramen</div>
            <div className="text-xl">{panoramas.length}</div>
          </div>
        </div>
      </div>

      {/* Editing Style */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4">Bearbeitungsstil</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#6F6F6F]">Bearbeitungsstil</span>
            <span>
              {orderData.editingStyle === 'styleA' && 'Stil A – Pix.immo Standard'}
              {orderData.editingStyle === 'styleB' && 'Stil B – Klar & kühl'}
              {orderData.editingStyle === 'styleC' && 'Stil C – Warm & soft'}
              {orderData.editingStyle === 'styleD' && 'Stil D – Magazin Plus'}
            </span>
          </div>
        </div>
      </div>

      {/* Text-Services */}
      {(orderData.createAltTexts || orderData.createCaptions) && (
        <div className="border border-[#C7C7C7] rounded-lg p-6">
          <h3 className="mb-4">Text-Services</h3>
          
          <div className="space-y-2">
            {orderData.createAltTexts && (
              <div className="flex items-center gap-2">
                <Check className="size-4 text-[#388E3C]" />
                <span>Alt-Texte erstellen lassen (SEO & Barrierefreiheit)</span>
              </div>
            )}
            {orderData.createCaptions && (
              <div className="flex items-center gap-2">
                <Check className="size-4 text-[#388E3C]" />
                <span>Bildunterschriften erstellen lassen (Exposé)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Retouches */}
      {selectedRetouches.length > 0 && (
        <div className="border border-[#C7C7C7] rounded-lg p-6">
          <h3 className="mb-4">Ausgewählte Retuschen</h3>
          
          <div className="space-y-2">
            {selectedRetouches.map(item => (
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
          <h3 className="mb-4">Zusätzliche Wünsche</h3>
          <div className="bg-[#F7F7F7] p-4 rounded border border-[#E6E6E6] whitespace-pre-wrap">
            {editingOptions.additionalNotes}
          </div>
        </div>
      )}

      {/* Room Types */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4">Raumtypen ({stacks.length} Stapel)</h3>
        
        <div className="space-y-2">
          {stacks.map((stack, idx) => (
            <div key={stack.id} className="flex justify-between py-2 border-b border-[#E6E6E6] last:border-0">
              <span className="text-[#6F6F6F]">Stapel {idx + 1}</span>
              <span>{stack.roomType || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panoramas Summary */}
      {panoramas.length > 0 && (
        <div className="border border-[#C7C7C7] rounded-lg p-6">
          <h3 className="mb-4">360° Panoramen</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#6F6F6F]">Anzahl Panoramen</span>
              <span>{panoramas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6F6F6F]">Verbindungen</span>
              <span>
                {panoramas.reduce((sum, p) => sum + p.connections.length, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6F6F6F]">Startpunkt gesetzt</span>
              <span>
                {panoramas.find(p => p.id === panoramas[0]?.id) ? (
                  <Check className="size-5 text-[#388E3C]" />
                ) : (
                  <AlertCircle className="size-5 text-[#D32F2F]" />
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      <div className="border-2 border-[#FBC02D] bg-[#FFFBF0] rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="size-6 text-[#FBC02D] flex-shrink-0" />
          <div>
            <h3 className="mb-2">Wichtiger Hinweis</h3>
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
        >
          <Lock className="size-5 mr-2" />
          Auftrag bestätigen und sperren
        </Button>
      </div>
    </div>
  );
}