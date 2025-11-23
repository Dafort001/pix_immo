import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X, Film, Globe } from 'lucide-react';
import { UploadFile, Stack } from '../UploadWorkflow';
import { Button } from '../ui/button';

interface StepUploadProps {
  files: UploadFile[];
  setFiles: (files: UploadFile[]) => void;
  stacks: Stack[];
  setStacks: (stacks: Stack[]) => void;
  unsortedFiles: UploadFile[];
  setUnsortedFiles: (files: UploadFile[]) => void;
}

export function StepUpload({
  files,
  setFiles,
  stacks,
  setStacks,
  unsortedFiles,
  setUnsortedFiles,
}: StepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize with 5 mock stacks
  useEffect(() => {
    if (files.length === 0 && stacks.length === 0) {
      const mockFiles: UploadFile[] = [
        {
          id: 'mock-1',
          name: 'Wohnzimmer.jpg',
          size: 4200000,
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1667584523543-d1d9cc828a15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYzNzk0MjU2fDA&ixlib=rb-4.1.0&q=80&w=1080',
          timestamp: new Date(),
          width: 6000,
          height: 4000,
          is360: false,
        },
        {
          id: 'mock-2',
          name: 'Küche.jpg',
          size: 3800000,
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1620086464194-5127366b51ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBraXRjaGVuJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYzNzkxMjY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
          timestamp: new Date(),
          width: 6000,
          height: 4000,
          is360: false,
        },
        {
          id: 'mock-3',
          name: 'Schlafzimmer.jpg',
          size: 4100000,
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzYzODEzODUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          timestamp: new Date(),
          width: 6000,
          height: 4000,
          is360: false,
        },
        {
          id: 'mock-4',
          name: 'Badezimmer.jpg',
          size: 3900000,
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1595515106705-257fa2d62381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYXRocm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2MzgyODY3OHww&ixlib=rb-4.1.0&q=80&w=1080',
          timestamp: new Date(),
          width: 6000,
          height: 4000,
          is360: false,
        },
        {
          id: 'mock-5',
          name: 'Arbeitszimmer.jpg',
          size: 4000000,
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1614598389565-8d56eddd2f48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwb2ZmaWNlJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2Mzc5MzA5OXww&ixlib=rb-4.1.0&q=80&w=1080',
          timestamp: new Date(),
          width: 6000,
          height: 4000,
          is360: false,
        },
      ];

      const mockStacks: Stack[] = [
        {
          id: 'stack-mock-1',
          files: [mockFiles[0]],
          roomType: 'Wohnzimmer',
          stackType: 'single',
        },
        {
          id: 'stack-mock-2',
          files: [mockFiles[1]],
          roomType: 'Küche',
          stackType: 'single',
        },
        {
          id: 'stack-mock-3',
          files: [mockFiles[2]],
          roomType: 'Schlafzimmer',
          stackType: 'single',
        },
        {
          id: 'stack-mock-4',
          files: [mockFiles[3]],
          roomType: 'Badezimmer',
          stackType: 'single',
        },
        {
          id: 'stack-mock-5',
          files: [mockFiles[4]],
          roomType: 'Arbeitszimmer',
          stackType: 'single',
        },
        {
          id: 'stack-mock-6',
          files: [{
            id: 'mock-6',
            name: 'Flur_Portrait.jpg',
            size: 3700000,
            type: 'image/jpeg',
            url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
            timestamp: new Date(),
            width: 4000,
            height: 6000,
            is360: false,
          }],
          roomType: 'Flur',
          stackType: 'single',
        },
        {
          id: 'stack-mock-7',
          files: [{
            id: 'mock-7',
            name: 'Außenansicht_Video.mp4',
            size: 15000000,
            type: 'video/mp4',
            url: '',
            timestamp: new Date(),
            width: 1920,
            height: 1080,
            is360: false,
          }],
          roomType: 'Außenansicht',
          stackType: 'video',
        },
      ];

      setFiles(mockFiles);
      setStacks(mockStacks);
    }
  }, [files.length, stacks.length, setFiles, setStacks]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const createMockFile = (file: File, index: number): UploadFile => {
    // Simulate 360 detection based on filename
    const is360 = file.name.toLowerCase().includes('360') || 
                  file.name.toLowerCase().includes('pano') ||
                  file.name.toLowerCase().includes('panorama');
    
    return {
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      timestamp: new Date(),
      is360,
      width: is360 ? 8000 : 6000,
      height: is360 ? 4000 : 4000,
    };
  };

  const groupFilesIntoStacks = (newFiles: UploadFile[]): Stack[] => {
    const grouped: Stack[] = [];
    const used = new Set<string>();

    // Group by base name and timestamp
    newFiles.forEach((file, idx) => {
      if (used.has(file.id)) return;

      if (file.is360) {
        grouped.push({
          id: `stack-${Date.now()}-${idx}`,
          files: [file],
          roomType: '',
          stackType: 'pano360',
        });
        used.add(file.id);
        return;
      }

      // Check for bracket groups (files with same base name)
      const baseName = file.name.replace(/[-_]\d+\./, '.');
      const similar = newFiles.filter(f => {
        if (used.has(f.id)) return false;
        const fBase = f.name.replace(/[-_]\d+\./, '.');
        return fBase === baseName;
      });

      if (similar.length >= 3 && similar.length <= 5) {
        grouped.push({
          id: `stack-${Date.now()}-${idx}`,
          files: similar,
          roomType: '',
          stackType: similar.length === 3 ? 'bracket3' : 'bracket5',
        });
        similar.forEach(f => used.add(f.id));
      } else if (file.type.includes('video')) {
        grouped.push({
          id: `stack-${Date.now()}-${idx}`,
          files: [file],
          roomType: '',
          stackType: 'video',
        });
        used.add(file.id);
      }
    });

    // Remaining files as singles or unsorted
    const remaining = newFiles.filter(f => !used.has(f.id));
    remaining.forEach((file, idx) => {
      grouped.push({
        id: `stack-${Date.now()}-single-${idx}`,
        files: [file],
        roomType: '',
        stackType: 'single',
      });
    });

    return grouped;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const mockFiles = droppedFiles.map((file, idx) => createMockFile(file, idx));

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      setTimeout(() => {
        const allFiles = [...files, ...mockFiles];
        setFiles(allFiles);
        
        const newStacks = groupFilesIntoStacks(mockFiles);
        setStacks([...stacks, ...newStacks]);
        setUploadProgress(0);
      }, 1200);
    },
    [files, stacks, setFiles, setStacks]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    const mockFiles = selectedFiles.map((file, idx) => createMockFile(file, idx));

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      const allFiles = [...files, ...mockFiles];
      setFiles(allFiles);
      
      const newStacks = groupFilesIntoStacks(mockFiles);
      setStacks([...stacks, ...newStacks]);
      setUploadProgress(0);
    }, 1200);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
    setStacks(stacks.filter(s => !s.files.some(f => f.id === fileId)));
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="mb-2">Upload Bereich</h2>
        <p className="text-[#6F6F6F] mb-6">
          Bitte laden Sie alle Dateien zu diesem Objekt hoch.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-24 text-center transition-colors ${
            isDragging
              ? 'border-black bg-[#F7F7F7]'
              : 'border-[#C7C7C7] bg-[#F7F7F7]'
          }`}
        >
          <Upload className="size-16 mx-auto mb-6 text-[#6F6F6F]" />
          <p className="text-xl mb-3">
            Dateien hierher ziehen oder{' '}
            <label className="text-black underline cursor-pointer">
              durchsuchen
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept="image/*,video/*"
              />
            </label>
          </p>
          <p className="text-[#6F6F6F] text-lg">
            Alle Dateitypen werden akzeptiert
          </p>
        </div>

        {uploadProgress > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-[#E6E6E6] rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[#6F6F6F] mt-2 text-center">
              Hochladen... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div>
          <h3 className="mb-4">
            Hochgeladene Dateien ({files.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map(file => (
              <div
                key={file.id}
                className="relative group border border-[#C7C7C7] rounded-lg overflow-hidden bg-[#F7F7F7]"
              >
                {file.type.includes('image') ? (
                  <div className="aspect-square bg-[#E6E6E6] flex items-center justify-center relative">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    {file.is360 && (
                      <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Globe className="size-3" />
                        360°
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-[#E6E6E6] flex items-center justify-center">
                    <Film className="size-12 text-[#6F6F6F]" />
                  </div>
                )}
                
                <div className="p-2">
                  <p className="text-xs truncate">{file.name}</p>
                  <p className="text-xs text-[#6F6F6F]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="absolute top-2 left-2 bg-white border border-[#C7C7C7] rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {stacks.length > 0 && (
        <div className="border-t border-[#C7C7C7] pt-8">
          <h3 className="mb-2">Stapelübersicht</h3>
          <p className="text-[#6F6F6F] mb-6">
            Ihre Aufnahmen wurden automatisch in Stapel gruppiert.
          </p>
          
          <div className="space-y-4">
            {stacks.map((stack, idx) => (
              <div
                key={stack.id}
                className="border border-[#C7C7C7] rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {stack.files.slice(0, 3).map(file => (
                      <div
                        key={file.id}
                        className="w-20 h-20 bg-[#E6E6E6] rounded border border-[#C7C7C7] overflow-hidden"
                      >
                        {file.type.includes('image') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="size-6 text-[#6F6F6F]" />
                          </div>
                        )}
                      </div>
                    ))}
                    {stack.files.length > 3 && (
                      <div className="w-20 h-20 bg-[#F7F7F7] border border-[#C7C7C7] rounded flex items-center justify-center">
                        <span className="text-[#6F6F6F]">
                          +{stack.files.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>Stapel {idx + 1}</span>
                      <span className="text-[#6F6F6F]">•</span>
                      <span className="text-[#6F6F6F]">
                        {stack.files.length} {stack.files.length === 1 ? 'Datei' : 'Dateien'}
                      </span>
                      <span className="text-[#6F6F6F]">•</span>
                      <span className="text-[#6F6F6F]">
                        {stack.stackType === 'single' && 'Einzelaufnahme'}
                        {stack.stackType === 'bracket3' && '3er-Bracket'}
                        {stack.stackType === 'bracket5' && '5er-Bracket'}
                        {stack.stackType === 'video' && 'Video'}
                        {stack.stackType === 'pano360' && '360° Panorama'}
                      </span>
                    </div>
                    <p className="text-[#6F6F6F]">
                      {stack.files[0].name}
                    </p>
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