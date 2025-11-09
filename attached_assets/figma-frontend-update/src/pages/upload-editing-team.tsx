import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner@2.0.3';
import {
  Upload,
  FileText,
  Download,
  Copy,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
  Save,
  Star,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

// Types
type UploadFile = {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  editingStyle: string;
  windowStyle: string;
  darkenTV: boolean;
  fireplaceOn: boolean;
  enhanceGreen: boolean;
  skySwap: string;
  comment: string;
  isStandard: boolean;
};

type Preset = {
  id: string;
  name: string;
  editingStyle: string;
  windowStyle: string;
  darkenTV: boolean;
  fireplaceOn: boolean;
  enhanceGreen: boolean;
  skySwap: string;
  comment: string;
};

// Constants
const ACCEPTED_FORMATS = [
  '.jpg', '.jpeg', '.raw', '.dng', '.arw', '.cr3', '.nef', '.tiff', '.heic', '.zip'
];

const EDITING_STYLES = [
  'Neutral / Real',
  'Granny',
  'Editorial',
  'Modern',
  'WHTNI',
];

const WINDOW_STYLES = [
  'Clear Windows',
  'Editorial',
  'Modern',
  'Nothing',
  'Bright/Nothing Outside',
];

const SKY_SWAP_OPTIONS = [
  'None',
  'Pastel Sky',
  'Blue Hour',
  'Cloudy',
  'Dramatic',
];

const GLOBAL_STYLES = [
  { value: 'neutral', label: 'Style A – Neutral / Real' },
  { value: 'clean', label: 'Style B – Clean / Bright' },
  { value: 'warm', label: 'Style C – Warm / Cozy' },
];

const WINDOW_RENDERING = [
  { value: 'clear', label: 'Clear & Natural' },
  { value: 'bloom', label: 'Soft Bloom / Gently diffused' },
  { value: 'neutral', label: 'Neutral No Color Cast' },
  { value: 'blur', label: 'Privacy / Soft Blur' },
];

const SKY_LOOKS = [
  { value: 'original', label: 'Original' },
  { value: 'blue', label: 'Light Blue' },
  { value: 'clouds', label: 'Cloud Structure' },
  { value: 'bluehour', label: 'Blue Hour' },
];

const GRASS_GREEN = [
  { value: 'natural', label: 'Natural' },
  { value: 'light', label: 'Light Green Boost' },
  { value: 'medium', label: 'Medium Green Boost' },
];

export default function UploadEditingTeam() {
  // 1️⃣ Job Information
  const [jobNumber, setJobNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [selectedGallery, setSelectedGallery] = useState('new');

  // 2️⃣ Upload State
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 5️⃣ Options
  const [removeExif, setRemoveExif] = useState(true);
  const [generateManifest, setGenerateManifest] = useState(true);

  // 6️⃣ Global Processing Settings
  const [globalStyle, setGlobalStyle] = useState('neutral');
  const [windowRendering, setWindowRendering] = useState('clear');
  const [skyLook, setSkyLook] = useState('original');
  const [fireplaceGlobal, setFireplaceGlobal] = useState(false);
  const [tvGlobal, setTvGlobal] = useState('black');
  const [grassGlobal, setGrassGlobal] = useState('natural');
  const [verticalLines, setVerticalLines] = useState(true);
  const [whiteBalance, setWhiteBalance] = useState(true);
  const [equalBrightness, setEqualBrightness] = useState(true);
  const [noObjectRemoval, setNoObjectRemoval] = useState(true);
  const [exportResolution, setExportResolution] = useState('original');

  // 8️⃣ Comments & Presets
  const [globalComment, setGlobalComment] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [savedPresets, setSavedPresets] = useState<Preset[]>([]);
  const [standardComments, setStandardComments] = useState<string[]>([
    'Darken windows slightly',
    'Activate fireplace only at dusk',
    'Neutral TV screens',
  ]);

  // 9️⃣ Summary & Links
  const [downloadLink, setDownloadLink] = useState('');
  const [returnUploadLink, setReturnUploadLink] = useState('');

  // UI State
  const [showStyleTable, setShowStyleTable] = useState(false);

  // Handle File Selection
  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ACCEPTED_FORMATS.includes(ext);
    });

    if (validFiles.length < fileArray.length) {
      toast.error('Einige Dateien wurden übersprungen (nicht unterstütztes Format)');
    }

    const newUploadFiles: UploadFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      editingStyle: EDITING_STYLES[0],
      windowStyle: WINDOW_STYLES[0],
      darkenTV: false,
      fireplaceOn: false,
      enhanceGreen: false,
      skySwap: SKY_SWAP_OPTIONS[0],
      comment: '',
      isStandard: false,
    }));

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
    toast.success(`${validFiles.length} Datei(en) hinzugefügt`);

    // Mock EXIF validation
    setTimeout(() => {
      const duplicates = validFiles.filter((f, i) => 
        validFiles.findIndex(x => x.name === f.name) !== i
      );
      if (duplicates.length > 0) {
        toast('⚠️ Duplicate detected — renamed automatically.');
      }
      toast.success('✅ All files verified successfully.');
    }, 500);
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove File
  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success('Datei entfernt');
  };

  // Update File Property
  const updateFile = <K extends keyof UploadFile>(
    id: string,
    key: K,
    value: UploadFile[K]
  ) => {
    setUploadFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  // Apply Preset to All
  const applyPresetToAll = (preset: Preset) => {
    setUploadFiles((prev) =>
      prev.map((f) => ({
        ...f,
        editingStyle: preset.editingStyle,
        windowStyle: preset.windowStyle,
        darkenTV: preset.darkenTV,
        fireplaceOn: preset.fireplaceOn,
        enhanceGreen: preset.enhanceGreen,
        skySwap: preset.skySwap,
        comment: preset.comment,
      }))
    );
    toast.success(`⚙️ Preset "${preset.name}" auf alle Dateien angewendet`);
  };

  // Save as Preset
  const saveCurrentAsPreset = () => {
    const name = prompt('Preset-Name:');
    if (!name) return;

    const firstFile = uploadFiles[0];
    if (!firstFile) {
      toast.error('Keine Dateien vorhanden');
      return;
    }

    const preset: Preset = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      editingStyle: firstFile.editingStyle,
      windowStyle: firstFile.windowStyle,
      darkenTV: firstFile.darkenTV,
      fireplaceOn: firstFile.fireplaceOn,
      enhanceGreen: firstFile.enhanceGreen,
      skySwap: firstFile.skySwap,
      comment: firstFile.comment,
    };

    setSavedPresets((prev) => [...prev, preset]);
    toast.success('⭐ Preset saved as default.');
  };

  // Upload to Cloudflare R2
  const handleUpload = async () => {
    if (!jobNumber || !propertyTitle) {
      toast.error('⚠️ Missing job number or object title.');
      return;
    }

    if (uploadFiles.length === 0) {
      toast.error('Keine Dateien zum Hochladen vorhanden');
      return;
    }

    setIsUploading(true);
    toast('🕓 Processing manifest…');

    // Mock upload process
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      updateFile(file.id, 'status', 'uploading');

      // Simulate upload progress
      for (let p = 0; p <= 100; p += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        updateFile(file.id, 'progress', p);
        setTotalProgress(((i * 100 + p) / uploadFiles.length));
      }

      updateFile(file.id, 'status', 'completed');
    }

    // Generate mock download link
    const mockLink = `https://r2.pix.immo/BUCKET_EDITING_TEAM_UPLOAD/${jobNumber}_${Date.now()}.zip`;
    setDownloadLink(mockLink);

    // Generate return upload link
    const returnLink = `https://pix.immo/upload/return/${Math.random().toString(36).substr(2, 12)}`;
    setReturnUploadLink(returnLink);

    setIsUploading(false);
    toast.success('✅ Upload completed successfully.');
    toast.success('📎 Download link generated.');
    toast.success('✅ CRM export ready.');
  };

  // CRM Export
  const handleCRMExport = (system: string) => {
    const data = uploadFiles.map((f) => ({
      filename: f.file.name,
      object_id: jobNumber,
      title: propertyTitle,
      room_type: '',
      alt_text: '',
      version: 'v1',
      tags: [],
      license: 'commercial_use',
      credit: 'pix.immo – Daniel Fortmann',
    }));

    console.log(`CRM Export (${system}):`, data);
    toast.success(`✅ CRM export ready (${system})`);
  };

  // Copy to Clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('📎 Download link copied.');
  };

  // Calculate Summary
  const totalFiles = uploadFiles.length;
  const totalSize = uploadFiles.reduce((sum, f) => sum + f.file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  const completedFiles = uploadFiles.filter((f) => f.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Upload → Editing Team"
        description="Upload und Verwaltung von Immobilienfotos für das Editing-Team"
        path="/upload-editing-team"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-2xl cursor-pointer">PIX.IMMO</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <h1 className="text-2xl mb-6">Upload → Editing Team</h1>

          {/* 1️⃣ Job Information */}
          <section className="mb-8 p-6 border border-border bg-muted/30 border-l-4" style={{ borderLeftColor: '#74A4EA' }}>
            <h2 className="text-xl mb-4">1️⃣ Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobNumber">Job Number *</Label>
                <Input
                  id="jobNumber"
                  value={jobNumber}
                  onChange={(e) => setJobNumber(e.target.value)}
                  placeholder="z.B. JOB-2024-1847"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientName">Client / Agent Name</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="z.B. Max Mustermann GmbH"
                />
              </div>
              <div>
                <Label htmlFor="propertyTitle">Property Title (Street / Object Name) *</Label>
                <Input
                  id="propertyTitle"
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  placeholder="z.B. Musterstraße 123, 22767 Hamburg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="shootDate">Shoot Date</Label>
                <Input
                  id="shootDate"
                  type="date"
                  value={shootDate}
                  onChange={(e) => setShootDate(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="gallery">Select Gallery</Label>
                <Select value={selectedGallery} onValueChange={setSelectedGallery}>
                  <SelectTrigger id="gallery">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create new gallery</SelectItem>
                    <SelectItem value="existing1">Musterstraße 123 (existing)</SelectItem>
                    <SelectItem value="existing2">Beispielweg 45 (existing)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Each upload is linked to its property gallery. The gallery title equals the property or street name — never 'My Gallery'.
                </p>
              </div>
            </div>
          </section>

          {/* 2️⃣ Upload Zone */}
          <section className="mb-8 p-6 border border-border border-l-4" style={{ borderLeftColor: '#64BF49' }}>
            <h2 className="text-xl mb-4">2️⃣ Upload Zone</h2>
            
            <div
              className={`border-2 border-dashed p-12 text-center transition-colors ${
                isDragging ? 'border-accent bg-accent/10' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2">Drag and drop files here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to select files
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_FORMATS.join(',')}
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong>Accepted Formats:</strong> JPG | RAW (DNG, ARW, CR3, NEF, TIFF, HEIC) | ZIP
              </p>
              <p className="text-xs text-muted-foreground">
                All files are uploaded in original quality — no compression or resizing. Keep the browser window open for large sets.
              </p>
            </div>

            {/* Progress Indicators */}
            {isUploading && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Progress</span>
                  <span>{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} />
                <p className="text-xs text-muted-foreground">
                  Remaining time: ~{Math.max(1, Math.round((100 - totalProgress) / 10))} min
                </p>
              </div>
            )}

            {/* File List */}
            {uploadFiles.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Files ({uploadFiles.length})</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadFiles([])}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-2 border border-border bg-background"
                    >
                      <ImageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        {file.status === 'uploading' && (
                          <Progress value={file.progress} className="mt-1 h-1" />
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {file.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#64BF49' }} />
                        )}
                        {file.status === 'uploading' && (
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#74A4EA' }} />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-4 h-4" style={{ color: '#C94B38' }} />
                        )}
                        {file.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 4️⃣ Manual File Naming (Room-Name Tool) */}
          <section className="mb-8 p-6 border border-border bg-muted/20 border-l-4" style={{ borderLeftColor: '#C9B55A' }}>
            <h2 className="text-xl mb-4">4️⃣ File Naming & Room Assignment</h2>
            <p className="text-sm mb-4">
              Use the Local Renamer (pix.immo v1.6.1) to manually assign each image to a room. 
              The tool reads EXIF automatically but requires manual room selection.
            </p>

            <div className="flex gap-3 mb-4">
              <Button variant="outline" asChild>
                <a href="/piximmo_local_renamer_v1_6_1.html" download>
                  <Download className="w-4 h-4 mr-2" />
                  Open Room-Name Tool
                </a>
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Renamed Files
              </Button>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Steps:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open the Renamer and import your folder.</li>
                <li>Assign room types (Living room, Kitchen, Bath …).</li>
                <li>Click "Apply Naming Schema v3.1" and review.</li>
                <li>Export renamed files plus manifest.csv, object_meta.json, crm_image_data.csv.</li>
                <li>Drag them back into this page.</li>
              </ol>
              <p className="mt-3 text-xs">
                <strong>Note:</strong> The renaming step is manual and must be completed before upload. 
                All filenames follow the v3.1 schema: <code>{'{date}-{shootcode}_{roomtype}_{index}_v1.jpg'}</code>
              </p>
            </div>
          </section>

          {/* 5️⃣ Options */}
          <section className="mb-8 p-6 border border-border border-l-4" style={{ borderLeftColor: '#8E9094' }}>
            <h2 className="text-xl mb-4">5️⃣ Options</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="removeExif"
                  checked={removeExif}
                  onCheckedChange={(checked) => setRemoveExif(!!checked)}
                />
                <Label htmlFor="removeExif" className="text-sm">
                  Remove EXIF/GPS from web derivatives (applies later for client delivery)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="generateManifest"
                  checked={generateManifest}
                  onCheckedChange={(checked) => setGenerateManifest(!!checked)}
                />
                <Label htmlFor="generateManifest" className="text-sm">
                  Generate manifest.json and alt_texts.json (for CRM integration)
                </Label>
              </div>
            </div>
          </section>

          {/* 6️⃣ Processing & Look Settings */}
          <section className="mb-8 p-6 border border-border bg-muted/30 border-l-4" style={{ borderLeftColor: '#D87088' }}>
            <h2 className="text-xl mb-4">6️⃣ Processing & Look Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Global visual directives passed to the editing team.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Global Style */}
              <div>
                <Label className="mb-3 block">Global Style</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={globalStyle === 'neutral' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${globalStyle === 'neutral' ? 'bg-[#8E9094] hover:bg-[#8E9094]/90' : ''}`}
                    onClick={() => setGlobalStyle('neutral')}
                  >
                    Style A – Neutral / Real
                  </Button>
                  <Button
                    variant={globalStyle === 'clean' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${globalStyle === 'clean' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setGlobalStyle('clean')}
                  >
                    Style B – Clean / Bright
                  </Button>
                  <Button
                    variant={globalStyle === 'warm' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${globalStyle === 'warm' ? 'bg-[#C9B55A] hover:bg-[#C9B55A]/90' : ''}`}
                    onClick={() => setGlobalStyle('warm')}
                  >
                    Style C – Warm / Cozy
                  </Button>
                </div>
              </div>

              {/* Window Rendering */}
              <div>
                <Label className="mb-3 block">Window Rendering</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={windowRendering === 'clear' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${windowRendering === 'clear' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setWindowRendering('clear')}
                  >
                    Clear & Natural
                  </Button>
                  <Button
                    variant={windowRendering === 'bloom' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${windowRendering === 'bloom' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setWindowRendering('bloom')}
                  >
                    Soft Bloom / Gently diffused
                  </Button>
                  <Button
                    variant={windowRendering === 'neutral' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${windowRendering === 'neutral' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setWindowRendering('neutral')}
                  >
                    Neutral No Color Cast
                  </Button>
                  <Button
                    variant={windowRendering === 'blur' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${windowRendering === 'blur' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setWindowRendering('blur')}
                  >
                    Privacy / Soft Blur
                  </Button>
                </div>
              </div>

              {/* Sky Look */}
              <div>
                <Label className="mb-3 block">Sky Look</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={skyLook === 'original' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${skyLook === 'original' ? 'bg-[#8E9094] hover:bg-[#8E9094]/90' : ''}`}
                    onClick={() => setSkyLook('original')}
                  >
                    Original
                  </Button>
                  <Button
                    variant={skyLook === 'blue' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${skyLook === 'blue' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setSkyLook('blue')}
                  >
                    Light Blue
                  </Button>
                  <Button
                    variant={skyLook === 'clouds' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${skyLook === 'clouds' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setSkyLook('clouds')}
                  >
                    Cloud Structure
                  </Button>
                  <Button
                    variant={skyLook === 'bluehour' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${skyLook === 'bluehour' ? 'bg-[#D87088] hover:bg-[#D87088]/90' : ''}`}
                    onClick={() => setSkyLook('bluehour')}
                  >
                    Blue Hour
                  </Button>
                </div>
              </div>

              {/* Fireplace */}
              <div>
                <Label className="mb-3 block">Fireplace</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={!fireplaceGlobal ? 'default' : 'outline'}
                    className={`justify-start text-sm ${!fireplaceGlobal ? 'bg-[#8E9094] hover:bg-[#8E9094]/90' : ''}`}
                    onClick={() => setFireplaceGlobal(false)}
                  >
                    Off (default)
                  </Button>
                  <Button
                    variant={fireplaceGlobal ? 'default' : 'outline'}
                    className={`justify-start text-sm ${fireplaceGlobal ? 'bg-[#C8B048] hover:bg-[#C8B048]/90' : ''}`}
                    onClick={() => setFireplaceGlobal(true)}
                  >
                    On – subtle flame
                  </Button>
                </div>
              </div>

              {/* TV / Screens */}
              <div>
                <Label className="mb-3 block">TV / Screens</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={tvGlobal === 'black' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${tvGlobal === 'black' ? 'bg-[#1A1A1C] hover:bg-[#1A1A1C]/90' : ''}`}
                    onClick={() => setTvGlobal('black')}
                  >
                    Black (default)
                  </Button>
                  <Button
                    variant={tvGlobal === 'gray' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${tvGlobal === 'gray' ? 'bg-[#8E9094] hover:bg-[#8E9094]/90' : ''}`}
                    onClick={() => setTvGlobal('gray')}
                  >
                    Neutral Gray (18%)
                  </Button>
                  <Button
                    variant={tvGlobal === 'intact' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${tvGlobal === 'intact' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                    onClick={() => setTvGlobal('intact')}
                  >
                    Reflections intact
                  </Button>
                </div>
              </div>

              {/* Grass / Exterior Green */}
              <div>
                <Label className="mb-3 block">Grass / Exterior Green</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={grassGlobal === 'natural' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${grassGlobal === 'natural' ? 'bg-[#64BF49] hover:bg-[#64BF49]/90' : ''}`}
                    onClick={() => setGrassGlobal('natural')}
                  >
                    Natural
                  </Button>
                  <Button
                    variant={grassGlobal === 'light' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${grassGlobal === 'light' ? 'bg-[#64BF49] hover:bg-[#64BF49]/90' : ''}`}
                    onClick={() => setGrassGlobal('light')}
                  >
                    Light Green Boost
                  </Button>
                  <Button
                    variant={grassGlobal === 'medium' ? 'default' : 'outline'}
                    className={`justify-start text-sm ${grassGlobal === 'medium' ? 'bg-[#64BF49] hover:bg-[#64BF49]/90' : ''}`}
                    onClick={() => setGrassGlobal('medium')}
                  >
                    Medium Green Boost
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Global Corrections */}
            <div>
              <Label className="mb-3 block">Global Corrections</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="verticalLines"
                    checked={verticalLines}
                    onCheckedChange={(checked) => setVerticalLines(!!checked)}
                  />
                  <Label htmlFor="verticalLines" className="text-sm">
                    Vertical lines aligned
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="whiteBalance"
                    checked={whiteBalance}
                    onCheckedChange={(checked) => setWhiteBalance(!!checked)}
                  />
                  <Label htmlFor="whiteBalance" className="text-sm">
                    White balance neutral
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="equalBrightness"
                    checked={equalBrightness}
                    onCheckedChange={(checked) => setEqualBrightness(!!checked)}
                  />
                  <Label htmlFor="equalBrightness" className="text-sm">
                    Equal brightness per room
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="noObjectRemoval"
                    checked={noObjectRemoval}
                    onCheckedChange={(checked) => setNoObjectRemoval(!!checked)}
                  />
                  <Label htmlFor="noObjectRemoval" className="text-sm">
                    No object removal
                  </Label>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Export Option */}
            <div>
              <Label className="mb-3 block">Export Option</Label>
              <div className="flex flex-col gap-2 max-w-sm">
                <Button
                  variant={exportResolution === 'original' ? 'default' : 'outline'}
                  className={`justify-start text-sm ${exportResolution === 'original' ? 'bg-[#8E9094] hover:bg-[#8E9094]/90' : ''}`}
                  onClick={() => setExportResolution('original')}
                >
                  Original Resolution (default)
                </Button>
                <Button
                  variant={exportResolution === 'web' ? 'default' : 'outline'}
                  className={`justify-start text-sm ${exportResolution === 'web' ? 'bg-[#74A4EA] hover:bg-[#74A4EA]/90' : ''}`}
                  onClick={() => setExportResolution('web')}
                >
                  Web Derivative 3000 px sRGB Q85
                </Button>
              </div>
            </div>
          </section>

          {/* 7️⃣ Editing & Style Protocol */}
          <section className="mb-8 p-6 border border-border border-l-4" style={{ borderLeftColor: '#C8B048' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">7️⃣ Editing & Style Protocol (per Image or Series)</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStyleTable(!showStyleTable)}
              >
                {showStyleTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {showStyleTable && uploadFiles.length > 0 && (
              <div className="overflow-x-auto">
                <div className="mb-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={saveCurrentAsPreset}>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Preset
                  </Button>
                  {savedPresets.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {savedPresets.map((preset) => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          size="sm"
                          onClick={() => applyPresetToAll(preset)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 min-w-[200px]">File / Preview</th>
                      <th className="text-left p-2 min-w-[120px]">Editing Style</th>
                      <th className="text-left p-2 min-w-[140px]">Window Style</th>
                      <th className="text-left p-2">Darken TV?</th>
                      <th className="text-left p-2">Fireplace?</th>
                      <th className="text-left p-2">Enhance Green?</th>
                      <th className="text-left p-2 min-w-[120px]">Sky Swap</th>
                      <th className="text-left p-2 min-w-[150px]">Comment</th>
                      <th className="text-left p-2">Standard ⭐</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadFiles.map((file) => (
                      <tr key={file.id} className="border-b border-border">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate max-w-[180px]" title={file.file.name}>
                              {file.file.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Select
                            value={file.editingStyle}
                            onValueChange={(v) => updateFile(file.id, 'editingStyle', v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EDITING_STYLES.map((style) => (
                                <SelectItem key={style} value={style}>
                                  {style}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Select
                            value={file.windowStyle}
                            onValueChange={(v) => updateFile(file.id, 'windowStyle', v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WINDOW_STYLES.map((style) => (
                                <SelectItem key={style} value={style}>
                                  {style}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={file.darkenTV}
                            onCheckedChange={(checked) =>
                              updateFile(file.id, 'darkenTV', !!checked)
                            }
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={file.fireplaceOn}
                            onCheckedChange={(checked) =>
                              updateFile(file.id, 'fireplaceOn', !!checked)
                            }
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={file.enhanceGreen}
                            onCheckedChange={(checked) =>
                              updateFile(file.id, 'enhanceGreen', !!checked)
                            }
                          />
                        </td>
                        <td className="p-2">
                          <Select
                            value={file.skySwap}
                            onValueChange={(v) => updateFile(file.id, 'skySwap', v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SKY_SWAP_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            className="h-8 text-xs"
                            value={file.comment}
                            onChange={(e) => updateFile(file.id, 'comment', e.target.value)}
                            placeholder="Note…"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={file.isStandard}
                            onCheckedChange={(checked) =>
                              updateFile(file.id, 'isStandard', !!checked)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="text-xs text-muted-foreground mt-4">
                  All table entries are stored in the project manifest and included in instructions.txt for the editing team.
                </p>
              </div>
            )}

            {showStyleTable && uploadFiles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Upload files first to configure editing styles.
              </p>
            )}
          </section>

          {/* 8️⃣ Comments & Standard Notes */}
          <section className="mb-8 p-6 border border-border bg-muted/20 border-l-4" style={{ borderLeftColor: '#74A4EA' }}>
            <h2 className="text-xl mb-4">8️⃣ Additional Comment or Instruction</h2>
            <Textarea
              value={globalComment}
              onChange={(e) => setGlobalComment(e.target.value)}
              placeholder="Example: Slightly darken window highlights, keep outdoor tone natural.&#10;Fireplace only when room is dim.&#10;Grass +10 % saturation, realistic color.&#10;Maintain neutral light balance throughout."
              rows={6}
              className="mb-3"
            />
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                id="saveAsDefault"
                checked={saveAsDefault}
                onCheckedChange={(checked) => setSaveAsDefault(!!checked)}
              />
              <Label htmlFor="saveAsDefault" className="text-sm">
                Set as Default for Future Projects
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Saved locally — automatically prefilled next time.
            </p>

            <div>
              <Label className="mb-2 block">Saved Standard Comments</Label>
              <div className="flex gap-2 flex-wrap">
                {standardComments.map((comment, idx) => (
                  <Badge key={idx} variant="outline" className="gap-2">
                    {comment}
                    <Star className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* 9️⃣ Summary & Delivery */}
          <section className="mb-8 p-6 border border-border bg-muted/30 border-l-4" style={{ borderLeftColor: '#64BF49' }}>
            <h2 className="text-xl mb-4">9️⃣ Summary & Delivery</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border border-border">
                <div className="text-2xl mb-1">{totalFiles}</div>
                <div className="text-xs text-muted-foreground">Total Files</div>
              </div>
              <div className="text-center p-4 border border-border">
                <div className="text-2xl mb-1">{completedFiles}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 border border-border">
                <div className="text-2xl mb-1">{totalSizeMB}</div>
                <div className="text-xs text-muted-foreground">MB</div>
              </div>
              <div className="text-center p-4 border border-border">
                <div className="text-2xl truncate" title={propertyTitle || 'N/A'}>
                  {propertyTitle ? propertyTitle.slice(0, 12) + '...' : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Gallery Name</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleUpload}
                disabled={isUploading || uploadFiles.length === 0}
                className="w-full bg-[#64BF49] text-white hover:bg-[#64BF49]/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Create Package & Upload
                  </>
                )}
              </Button>

              {downloadLink && (
                <div className="flex gap-2">
                  <Input value={downloadLink} readOnly className="text-xs" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(downloadLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {returnUploadLink && (
                <div className="flex gap-2">
                  <Input
                    value={returnUploadLink}
                    readOnly
                    className="text-xs"
                    placeholder="Return Upload Link"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(returnUploadLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              After upload, originals remain untouched. The editor receives a secure download link and returns one ZIP (v2).
            </p>
          </section>

          {/* 11️⃣ CRM / Metadata Export */}
          <section className="mb-8 p-6 border border-border border-l-4" style={{ borderLeftColor: '#C9B55A' }}>
            <h2 className="text-xl mb-4">11️⃣ CRM / Metadata Export</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically generated files: manifest.csv, object_meta.json, crm_image_data.csv
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleCRMExport('FIO')}
              >
                FIO
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCRMExport('onOffice')}
              >
                onOffice
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCRMExport('Propstack')}
              >
                Propstack
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCRMExport('CSV')}
              >
                Generic CSV / JSON
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Fields included: filename | object_id | title | room_type | alt_text | version | tags | license | credit
            </p>
          </section>

          {/* 12️⃣ QA Checklist */}
          <section className="mb-8 p-6 border border-border bg-muted/20 border-l-4" style={{ borderLeftColor: '#64BF49' }}>
            <h2 className="text-xl mb-4">12️⃣ QA Checklist</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#64BF49' }} />
                <span className="text-sm">No compression before upload</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#64BF49' }} />
                <span className="text-sm">Filenames follow schema v3.1</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#64BF49' }} />
                <span className="text-sm">Manifest + CRM files present</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#64BF49' }} />
                <span className="text-sm">Processing settings confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#64BF49' }} />
                <span className="text-sm">Return link tested</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
}
