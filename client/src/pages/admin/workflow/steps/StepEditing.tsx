import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
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
  isLocked?: boolean;
}

export function StepEditing({
  orderData,
  setOrderData,
  editingOptions,
  setEditingOptions,
  isLocked = false,
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
          disabled={isLocked}
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

      {/* Fensterstil */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Fensterstil</h3>
        <p className="text-[#6F6F6F] mb-4">
          Wählen Sie die Behandlung von Fenstern in Innenaufnahmen.
        </p>

        <RadioGroup
          value={orderData.windowStyle}
          onValueChange={(value) => setOrderData({ ...orderData, windowStyle: value })}
          disabled={isLocked}
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="neutral" id="window-neutral" className="mt-0.5" data-testid="radio-window-neutral" />
              <div className="flex-1">
                <label
                  htmlFor="window-neutral"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Neutral
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Fenster werden natürlich dargestellt, leichte Belichtungsanpassung
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="bright" id="window-bright" className="mt-0.5" data-testid="radio-window-bright" />
              <div className="flex-1">
                <label
                  htmlFor="window-bright"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Hell/Tag
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Helle Fensterdarstellung mit durchgezeichneter Außenansicht
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="dusk" id="window-dusk" className="mt-0.5" data-testid="radio-window-dusk" />
              <div className="flex-1">
                <label
                  htmlFor="window-dusk"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Dämmerung
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Warme Dämmerungsstimmung durch die Fenster sichtbar
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="night" id="window-night" className="mt-0.5" data-testid="radio-window-night" />
              <div className="flex-1">
                <label
                  htmlFor="window-night"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Nacht
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Dunkle Fenster mit Stadtlichtern oder Nachtstimmung
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Himmelstil */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4 text-xl font-semibold">Himmel-Austausch (Außenaufnahmen)</h3>
        <p className="text-[#6F6F6F] mb-4">
          Wählen Sie einen Himmelstil für Außenaufnahmen oder belassen Sie den Original-Himmel.
        </p>

        <RadioGroup
          value={orderData.skyStyle}
          onValueChange={(value) => setOrderData({ ...orderData, skyStyle: value })}
          disabled={isLocked}
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="none" id="sky-none" className="mt-0.5" data-testid="radio-sky-none" />
              <div className="flex-1">
                <label
                  htmlFor="sky-none"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Kein Himmel-Austausch
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Original-Himmel wird beibehalten und optimiert
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="skyA" id="sky-a" className="mt-0.5" data-testid="radio-sky-a" />
              <div className="flex-1">
                <label
                  htmlFor="sky-a"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Himmel A – Klarer blauer Himmel
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Strahlend blauer Himmel, wenige Wolken, perfekt für sonnige Tage
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="skyB" id="sky-b" className="mt-0.5" data-testid="radio-sky-b" />
              <div className="flex-1">
                <label
                  htmlFor="sky-b"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Himmel B – Schönwetter-Wolken
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Leichte weiße Wolken auf blauem Grund, natürlich und lebendig
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="skyC" id="sky-c" className="mt-0.5" data-testid="radio-sky-c" />
              <div className="flex-1">
                <label
                  htmlFor="sky-c"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Himmel C – Dramatische Wolken
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Kontrastreiche Wolkenformationen, ideal für Premium-Objekte
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="skyD" id="sky-d" className="mt-0.5" data-testid="radio-sky-d" />
              <div className="flex-1">
                <label
                  htmlFor="sky-d"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Himmel D – Sonnenuntergang
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Warme Abendstimmung mit orangefarbenen und rosa Tönen
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="skyE" id="sky-e" className="mt-0.5" data-testid="radio-sky-e" />
              <div className="flex-1">
                <label
                  htmlFor="sky-e"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Himmel E – Dämmerung
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Blaue Stunde mit weichem Übergang zwischen Tag und Nacht
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="skyF" id="sky-f" className="mt-0.5" data-testid="radio-sky-f" />
              <div className="flex-1">
                <label
                  htmlFor="sky-f"
                  className="cursor-pointer leading-none block mb-1 font-medium"
                >
                  Himmel F – Nachthimmel
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Dunkler Nachthimmel mit Sternenhimmel oder Stadtlichtern
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
            />
            <label
              htmlFor="addFireplace"
              className="cursor-pointer leading-none"
            >
              Kaminfeuer einfügen (falls Kamin vorhanden)
            </label>
          </div>
        </div>

        {/* Kostenwarnung */}
        {(editingOptions.removeOutlets || 
          editingOptions.removeBins || 
          editingOptions.reducePersonalItems || 
          editingOptions.neutralizeTV || 
          editingOptions.optimizeLawn || 
          editingOptions.addFireplace) && (
          <div className="mt-6 p-4 bg-[#FFF9E6] border border-[#FFD700] rounded-lg flex items-start gap-3">
            <AlertCircle className="size-5 text-[#D4A200] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm mb-1">Hinweis zu Mehrkosten</p>
              <p className="text-[#6F6F6F] text-sm">
                Die gewählten Retusche-Optionen können zusätzliche Bearbeitungskosten verursachen. 
                Der Endpreis wird nach Prüfung des Aufwands durch das Editing-Team bestätigt.
              </p>
            </div>
          </div>
        )}
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
          disabled={isLocked}
        />
        <p className="text-[#6F6F6F] mt-2 text-sm">
          Hinweis: Ihre Angaben werden automatisch für das Editing-Team übersetzt.
        </p>
      </div>
    </div>
  );
}
