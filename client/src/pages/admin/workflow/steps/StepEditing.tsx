import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { OrderData, EditingOptions, Stack, UploadFile, Panorama } from '../UploadWorkflow';

interface StepEditingProps {
  orderData: OrderData;
  setOrderData: (data: OrderData) => void;
  editingOptions: EditingOptions;
  setEditingOptions: (options: EditingOptions) => void;
  stacks: Stack[];
  setStacks: (stacks: Stack[]) => void;
  files: UploadFile[];
  enable360Tour: boolean;
  setEnable360Tour: (enable: boolean) => void;
  panoramas: Panorama[];
  setPanoramas: (panoramas: Panorama[]) => void;
  floorplan: string | null;
  setFloorplan: (floorplan: string | null) => void;
  startPanorama: string | null;
  setStartPanorama: (id: string | null) => void;
}

export function StepEditing({
  orderData,
  setOrderData,
  editingOptions,
  setEditingOptions,
}: StepEditingProps) {
  const handleCheckboxChange = (key: keyof EditingOptions, checked: boolean) => {
    setEditingOptions({
      ...editingOptions,
      [key]: checked,
    });
  };

  const handleNotesChange = (value: string) => {
    setEditingOptions({
      ...editingOptions,
      additionalNotes: value,
    });
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Editing-Optionen</h2>
        <p className="text-[#6F6F6F] mb-6">
          Wählen Sie den Bearbeitungsstil und die gewünschten Anpassungen.
        </p>
      </div>

      {/* Bearbeitungsstil */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Bearbeitungsstil</h3>
        <p className="text-[#6F6F6F] mb-4">
          Wählen Sie das gewünschte Ergebnis für die Bildbearbeitung.
        </p>

        <RadioGroup
          value={orderData.editingStyle}
          onValueChange={(value) => setOrderData({ ...orderData, editingStyle: value })}
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleA" id="styleA" className="mt-0.5" data-testid="radio-styleA" />
              <div className="flex-1">
                <label
                  htmlFor="styleA"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Stil A – Pix.immo Standard
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Ausgewogene Bearbeitung für professionelle Immobilienpräsentation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleB" id="styleB" className="mt-0.5" data-testid="radio-styleB" />
              <div className="flex-1">
                <label
                  htmlFor="styleB"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Stil B – Klar & kühl
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Klare Linien und kühle Farbgebung für moderne Objekte
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleC" id="styleC" className="mt-0.5" data-testid="radio-styleC" />
              <div className="flex-1">
                <label
                  htmlFor="styleC"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Stil C – Warm & soft
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Warme Töne und weiche Übergänge für gemütliche Atmosphäre
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleD" id="styleD" className="mt-0.5" data-testid="radio-styleD" />
              <div className="flex-1">
                <label
                  htmlFor="styleD"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Stil D – Magazin Plus
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Premium-Bearbeitung für hochwertige Publikationen
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Retusche und Korrekturen */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Retusche & Bildkorrekturen</h3>
        <p className="text-[#6F6F6F] mb-6">
          Wählen Sie aus, welche zusätzlichen Bildkorrekturen für dieses Objekt durchgeführt werden sollen.
        </p>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="removeOutlets"
              checked={editingOptions.removeOutlets}
              onCheckedChange={(checked) =>
                handleCheckboxChange('removeOutlets', checked as boolean)
              }
              data-testid="checkbox-removeOutlets"
            />
            <label
              htmlFor="removeOutlets"
              className="cursor-pointer leading-none"
            >
              Störende Kabel und sichtbare Steckdosen entfernen
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="removeBins"
              checked={editingOptions.removeBins}
              onCheckedChange={(checked) =>
                handleCheckboxChange('removeBins', checked as boolean)
              }
              data-testid="checkbox-removeBins"
            />
            <label
              htmlFor="removeBins"
              className="cursor-pointer leading-none"
            >
              Mülleimer, Wäschekörbe und Reinigungsartikel entfernen
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="reducePersonalItems"
              checked={editingOptions.reducePersonalItems}
              onCheckedChange={(checked) =>
                handleCheckboxChange('reducePersonalItems', checked as boolean)
              }
              data-testid="checkbox-reducePersonalItems"
            />
            <label
              htmlFor="reducePersonalItems"
              className="cursor-pointer leading-none"
            >
              Persönliche Gegenstände reduzieren
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="neutralizeTV"
              checked={editingOptions.neutralizeTV}
              onCheckedChange={(checked) =>
                handleCheckboxChange('neutralizeTV', checked as boolean)
              }
              data-testid="checkbox-neutralizeTV"
            />
            <label
              htmlFor="neutralizeTV"
              className="cursor-pointer leading-none"
            >
              Fernsehbild neutral darstellen (schwarzer Bildschirm)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="optimizeLawn"
              checked={editingOptions.optimizeLawn}
              onCheckedChange={(checked) =>
                handleCheckboxChange('optimizeLawn', checked as boolean)
              }
              data-testid="checkbox-optimizeLawn"
            />
            <label
              htmlFor="optimizeLawn"
              className="cursor-pointer leading-none"
            >
              Rasen optisch verbessern (gleichmäßiger, grüner, gepflegter)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="addFireplace"
              checked={editingOptions.addFireplace}
              onCheckedChange={(checked) =>
                handleCheckboxChange('addFireplace', checked as boolean)
              }
              data-testid="checkbox-addFireplace"
            />
            <label
              htmlFor="addFireplace"
              className="cursor-pointer leading-none"
            >
              Kaminfeuer einfügen (falls Kamin vorhanden)
            </label>
          </div>
        </div>
      </div>

      {/* Zusätzliche Wünsche */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Zusätzliche Wünsche</h3>
        <p className="text-[#6F6F6F] mb-4">
          Bitte beschreiben Sie hier besondere Anforderungen.
        </p>

        <Textarea
          placeholder="Ihre zusätzlichen Wünsche..."
          value={editingOptions.additionalNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="min-h-[120px] border-[#C7C7C7]"
          data-testid="textarea-additional-notes"
        />
        <p className="text-[#6F6F6F] mt-2 text-sm">
          Hinweis: Ihre Angaben werden automatisch für das Editing-Team übersetzt.
        </p>
      </div>
    </div>
  );
}
