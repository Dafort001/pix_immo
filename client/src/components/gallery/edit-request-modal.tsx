import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnnotation?: () => void;
  onSubmit?: (editType: string, description: string) => void;
}

export function EditRequestModal({ 
  isOpen, 
  onClose,
  onStartAnnotation,
  onSubmit
}: EditRequestModalProps) {
  const [editType, setEditType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(editType, description);
    }
    setEditType('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[560px] p-0 bg-white">
        <DialogTitle className="sr-only">Bearbeitung anfordern</DialogTitle>
        <DialogDescription className="sr-only">
          Wählen Sie die Art der Bearbeitung und beschreiben Sie Ihre Anforderungen
        </DialogDescription>
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-gray-800 text-base sm:text-lg" data-testid="text-modal-title">Bearbeitung anfordern</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              data-testid="button-close-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Formular */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="edit-type" className="text-sm sm:text-base">Art der Bearbeitung</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger id="edit-type" className="w-full" data-testid="select-edit-type">
                  <SelectValue placeholder="Bitte auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remove-objects">Objekte entfernen</SelectItem>
                  <SelectItem value="virtual-staging">Virtuelles Staging</SelectItem>
                  <SelectItem value="color-correction">Farbkorrektur</SelectItem>
                  <SelectItem value="perspective-correction">Perspektivkorrektur</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Freitextfeld */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base">Beschreibung</Label>
              <Textarea 
                id="description"
                placeholder="Bitte beschreiben Sie die gewünschte Bearbeitung..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="resize-none text-sm sm:text-base"
                data-testid="textarea-description"
              />
            </div>
            
            {/* Annotation Button */}
            <Button 
              variant="outline"
              onClick={onStartAnnotation}
              className="w-full border-blue-500 text-blue-600 text-sm sm:text-base"
              data-testid="button-start-annotation"
            >
              Annotation starten
            </Button>
          </div>
          
          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="text-sm sm:text-base"
              data-testid="button-cancel"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-[#2d2d2d] text-white text-sm sm:text-base"
              data-testid="button-submit"
            >
              Absenden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
