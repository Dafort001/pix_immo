import React from 'react';
import { OrderData, EditingOptions, Stack, UploadFile, Panorama } from '../UploadWorkflow';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { PanoramaSection } from './PanoramaSection';

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

const EDITING_STYLES = [
  'Stil A – Pix.immo Standard',
  'Stil B – Klar & kühl',
  'Stil C – Warm & soft',
  'Stil D – Magazin Plus',
];

const WINDOW_STYLES = [
  'Neutral',
  'Clear View',
  'Privacy',
  'Skandinavisch hell',
];

const SKY_STYLES = [
  'Himmel A',
  'Himmel B',
  'Himmel C',
  'Himmel D',
  'Himmel E',
  'Himmel F',
  'Kein Himmeltausch',
];

export function StepEditing({
  orderData,
  setOrderData,
  editingOptions,
  setEditingOptions,
  stacks,
  setStacks,
  files,
  enable360Tour,
  setEnable360Tour,
  panoramas,
  setPanoramas,
  floorplan,
  setFloorplan,
  startPanorama,
  setStartPanorama,
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

  const handleStackNoteChange = (stackId: string, note: string) => {
    setStacks(
      stacks.map(stack =>
        stack.id === stackId ? { ...stack, note } : stack
      )
    );
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl">
      <div>
        <h2 className="mb-2">Editing-Optionen</h2>
        <p className="text-[#6F6F6F] mb-6">
          Wählen Sie den Bearbeitungsstil und die gewünschten Anpassungen.
        </p>
      </div>

      {/* Bearbeitungsstil */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4">Bearbeitungsstil</h3>
        <p className="text-[#6F6F6F] mb-4">
          Wählen Sie das gewünschte Ergebnis für die Bildbearbeitung.
        </p>

        <RadioGroup
          value={orderData.editingStyle}
          onValueChange={value => setOrderData({ ...orderData, editingStyle: value })}
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleA" id="styleA" className="mt-0.5" />
              <div className="flex-1">
                <label
                  htmlFor="styleA"
                  className="cursor-pointer leading-none block mb-1"
                >
                  Stil A – Pix.immo Standard
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Ausgewogene Bearbeitung für professionelle Immobilienpräsentation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleB" id="styleB" className="mt-0.5" />
              <div className="flex-1">
                <label
                  htmlFor="styleB"
                  className="cursor-pointer leading-none block mb-1"
                >
                  Stil B – Klar & kühl
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Klare Linien und kühle Farbgebung für moderne Objekte
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleC" id="styleC" className="mt-0.5" />
              <div className="flex-1">
                <label
                  htmlFor="styleC"
                  className="cursor-pointer leading-none block mb-1"
                >
                  Stil C – Warm & soft
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Warme Töne und weiche Übergänge für gemütliche Atmosphäre
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="styleD" id="styleD" className="mt-0.5" />
              <div className="flex-1">
                <label
                  htmlFor="styleD"
                  className="cursor-pointer leading-none block mb-1"
                >
                  Stil D – Magazin Plus
                </label>
                <p className="text-[#6F6F6F] text-sm">
                  Premium-Bearbeitung für hochwertige Publikationen
                </p>
              </div>
            </div>

            {/* Text-Services */}
            <div className="pt-4 mt-4 border-t border-[#E6E6E6]">
              <p className="text-[#6F6F6F] mb-4 text-sm">
                Professionell formulierte Bildtexte optimieren die Auffindbarkeit und Präsentation.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="createAltTexts"
                    checked={orderData.createAltTexts}
                    onCheckedChange={checked =>
                      setOrderData({ ...orderData, createAltTexts: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="createAltTexts"
                      className="cursor-pointer leading-none block mb-1"
                    >
                      Alt-Texte erstellen lassen (SEO & Barrierefreiheit)
                    </label>
                    <p className="text-[#6F6F6F] text-sm">
                      Beschreibende Texte für Screenreader und Suchmaschinen-Optimierung
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="createCaptions"
                    checked={orderData.createCaptions}
                    onCheckedChange={checked =>
                      setOrderData({ ...orderData, createCaptions: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="createCaptions"
                      className="cursor-pointer leading-none block mb-1"
                    >
                      Bildunterschriften erstellen lassen (Exposé)
                    </label>
                    <p className="text-[#6F6F6F] text-sm">
                      Verkaufsstarke Texte für Ihre Exposé-Bilder
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-[#F7F7F7] rounded border border-[#E6E6E6]">
                <p className="text-[#6F6F6F] text-sm">
                  Die Texte werden nach Fertigstellung in Ihrer Kundengalerie angezeigt.
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Retusche und Korrekturen */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <h3 className="mb-4">Retusche & Bildkorrekturen</h3>
        <p className="text-[#6F6F6F] mb-2">
          Wählen Sie aus, welche zusätzlichen Bildkorrekturen für dieses Objekt durchgeführt werden sollen.
        </p>
        <p className="text-[#6F6F6F] mb-6">
          Hinweis: Diese Leistungen sind kostenpflichtig gemäß aktueller{' '}
          <a href="#" className="text-black underline">Preisliste</a>.
        </p>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="removeOutlets"
              checked={editingOptions.removeOutlets}
              onCheckedChange={checked =>
                handleCheckboxChange('removeOutlets', checked as boolean)
              }
            />
            <label
              htmlFor="removeOutlets"
              className="cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Störende Kabel und sichtbare Steckdosen entfernen
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="removeBins"
              checked={editingOptions.removeBins}
              onCheckedChange={checked =>
                handleCheckboxChange('removeBins', checked as boolean)
              }
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
              onCheckedChange={checked =>
                handleCheckboxChange('reducePersonalItems', checked as boolean)
              }
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
              onCheckedChange={checked =>
                handleCheckboxChange('neutralizeTV', checked as boolean)
              }
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
              onCheckedChange={checked =>
                handleCheckboxChange('optimizeLawn', checked as boolean)
              }
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
              onCheckedChange={checked =>
                handleCheckboxChange('addFireplace', checked as boolean)
              }
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
        <h3 className="mb-4">Zusätzliche Wünsche</h3>
        <p className="text-[#6F6F6F] mb-4">
          Bitte beschreiben Sie hier besondere Anforderungen.
        </p>

        <Textarea
          placeholder="Ihre zusätzlichen Wünsche..."
          value={editingOptions.additionalNotes}
          onChange={e => handleNotesChange(e.target.value)}
          className="min-h-[120px] border-[#C7C7C7]"
        />
      </div>

      {/* 360° Tour Option */}
      <div className="border border-[#C7C7C7] rounded-lg p-6">
        <div className="flex items-start space-x-3 mb-4">
          <Checkbox
            id="enable360Tour"
            checked={enable360Tour}
            onCheckedChange={checked => setEnable360Tour(checked as boolean)}
          />
          <div className="flex-1">
            <label
              htmlFor="enable360Tour"
              className="cursor-pointer leading-none block mb-1"
            >
              Ich möchte eine 360°-Tour erstellen
            </label>
            <p className="text-[#6F6F6F]">
              Aktivieren Sie diese Option, um interaktive 360°-Panoramen hochzuladen und zu verknüpfen.
            </p>
          </div>
        </div>

        {enable360Tour && (
          <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
            <PanoramaSection
              files={files}
              panoramas={panoramas}
              setPanoramas={setPanoramas}
              floorplan={floorplan}
              setFloorplan={setFloorplan}
              startPanorama={startPanorama}
              setStartPanorama={setStartPanorama}
            />
          </div>
        )}
      </div>

      {/* Per-Stack Kommentare */}
      {stacks.length > 0 && (
        <div className="border border-[#C7C7C7] rounded-lg p-6">
          <h3 className="mb-4">Zusätzliche Retusche pro Bild</h3>
          <p className="text-[#6F6F6F] mb-6">
            Bitte beschreiben Sie die gewünschte Änderung für einzelne Stapel.
          </p>

          <div className="space-y-4">
            {stacks.map((stack, index) => (
              <div key={stack.id} className="border border-[#E6E6E6] rounded p-4">
                <div className="flex gap-4 mb-3">
                  <div className="w-16 h-16 bg-[#E6E6E6] rounded border border-[#C7C7C7] overflow-hidden flex-shrink-0">
                    {stack.files[0].type.includes('image') && (
                      <img
                        src={stack.files[0].url}
                        alt={stack.files[0].name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      Stapel {index + 1} – {stack.roomType || 'Kein Raumtyp'}
                    </div>
                    <Textarea
                      placeholder="Zusätzliche Retusche für dieses Bild..."
                      value={(stack as any).note || ''}
                      onChange={e => handleStackNoteChange(stack.id, e.target.value)}
                      className="min-h-[80px] border-[#C7C7C7]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}