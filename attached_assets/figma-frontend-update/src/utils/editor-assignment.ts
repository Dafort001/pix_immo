/**
 * Editor Assignment System
 * 
 * Verwaltet die Zuweisung von Jobs an verschiedene Editoren
 * basierend auf Verfügbarkeit, Spezialisierung und Workload
 */

export type EditorSpecialization = 
  | 'interior' 
  | 'exterior' 
  | 'twilight' 
  | 'aerial' 
  | 'luxury'
  | 'standard';

export type EditorStatus = 'available' | 'busy' | 'offline';

export interface Editor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: EditorStatus;
  specialization: EditorSpecialization[];
  currentJobs: number;
  maxJobs: number;
  completedJobs: number;
  avgTurnaroundHours: number;
  qualityScore: number; // 0-100
  preferredSources?: ('app' | 'professional')[]; // Bevorzugte Pipeline
}

export interface JobAssignment {
  jobId: string;
  editorId: string;
  assignedAt: string;
  assignedBy: string; // Admin/System
  dueDate: string;
  priority: 'normal' | 'hoch' | 'dringend';
  estimatedHours: number;
  notes?: string;
}

// Mock Editor Database
export const EDITORS: Editor[] = [
  {
    id: 'editor-001',
    name: 'Sarah Müller',
    email: 'sarah@pix.immo',
    status: 'available',
    specialization: ['interior', 'luxury', 'standard'],
    currentJobs: 2,
    maxJobs: 8,
    completedJobs: 342,
    avgTurnaroundHours: 18,
    qualityScore: 98,
    preferredSources: ['professional'],
  },
  {
    id: 'editor-002',
    name: 'Tom Krüger',
    email: 'tom@pix.immo',
    status: 'available',
    specialization: ['interior', 'exterior', 'standard'],
    currentJobs: 5,
    maxJobs: 10,
    completedJobs: 521,
    avgTurnaroundHours: 16,
    qualityScore: 96,
    preferredSources: ['app', 'professional'],
  },
  {
    id: 'editor-003',
    name: 'Julia Weber',
    email: 'julia@pix.immo',
    status: 'busy',
    specialization: ['twilight', 'exterior', 'luxury'],
    currentJobs: 7,
    maxJobs: 8,
    completedJobs: 189,
    avgTurnaroundHours: 24,
    qualityScore: 99,
    preferredSources: ['professional'],
  },
  {
    id: 'editor-004',
    name: 'Max Schmidt',
    email: 'max@pix.immo',
    status: 'available',
    specialization: ['aerial', 'exterior', 'standard'],
    currentJobs: 1,
    maxJobs: 6,
    completedJobs: 276,
    avgTurnaroundHours: 20,
    qualityScore: 94,
    preferredSources: ['app'],
  },
  {
    id: 'editor-005',
    name: 'Anna Fischer',
    email: 'anna@pix.immo',
    status: 'offline',
    specialization: ['interior', 'standard'],
    currentJobs: 0,
    maxJobs: 8,
    completedJobs: 423,
    avgTurnaroundHours: 15,
    qualityScore: 97,
    preferredSources: ['app', 'professional'],
  },
];

/**
 * Ermittelt verfügbare Editoren basierend auf Kriterien
 */
export function getAvailableEditors(filters?: {
  source?: 'app' | 'professional';
  specialization?: EditorSpecialization;
  maxCurrentJobs?: number;
}): Editor[] {
  return EDITORS.filter((editor) => {
    // Nur verfügbare Editoren
    if (editor.status === 'offline') return false;
    
    // Workload-Check
    if (filters?.maxCurrentJobs && editor.currentJobs >= filters.maxCurrentJobs) {
      return false;
    }
    
    // Nicht über Maximum
    if (editor.currentJobs >= editor.maxJobs) return false;
    
    // Source-Präferenz
    if (filters?.source && editor.preferredSources) {
      if (!editor.preferredSources.includes(filters.source)) return false;
    }
    
    // Spezialisierung
    if (filters?.specialization) {
      if (!editor.specialization.includes(filters.specialization)) return false;
    }
    
    return true;
  });
}

/**
 * Automatische Editor-Zuweisung basierend auf Smart-Matching
 */
export function autoAssignEditor(
  jobId: string,
  source: 'app' | 'professional',
  priority: 'normal' | 'hoch' | 'dringend',
  imageCount: number
): Editor | null {
  const availableEditors = getAvailableEditors({ source });
  
  if (availableEditors.length === 0) return null;
  
  // Scoring-System für optimale Zuweisung
  const scoredEditors = availableEditors.map((editor) => {
    let score = 0;
    
    // Workload-Score (weniger Jobs = höherer Score)
    const workloadRatio = editor.currentJobs / editor.maxJobs;
    score += (1 - workloadRatio) * 40;
    
    // Qualitäts-Score
    score += (editor.qualityScore / 100) * 30;
    
    // Turnaround-Score (schneller = besser)
    const turnaroundScore = Math.max(0, 100 - editor.avgTurnaroundHours * 2);
    score += (turnaroundScore / 100) * 20;
    
    // Prioritäts-Bonus
    if (priority === 'dringend' && editor.avgTurnaroundHours < 20) {
      score += 10;
    }
    
    // Source-Präferenz-Bonus
    if (editor.preferredSources?.includes(source)) {
      score += 10;
    }
    
    return { editor, score };
  });
  
  // Sortiere nach Score
  scoredEditors.sort((a, b) => b.score - a.score);
  
  return scoredEditors[0]?.editor || null;
}

/**
 * Manuelle Editor-Zuweisung
 */
export function assignJobToEditor(
  jobId: string,
  editorId: string,
  assignedBy: string,
  dueDate: string,
  priority: 'normal' | 'hoch' | 'dringend',
  estimatedHours: number,
  notes?: string
): JobAssignment {
  return {
    jobId,
    editorId,
    assignedAt: new Date().toISOString(),
    assignedBy,
    dueDate,
    priority,
    estimatedHours,
    notes,
  };
}

/**
 * Editor nach ID finden
 */
export function getEditorById(editorId: string): Editor | undefined {
  return EDITORS.find((e) => e.id === editorId);
}

/**
 * Editor-Statistiken
 */
export function getEditorStats() {
  const totalEditors = EDITORS.length;
  const availableEditors = EDITORS.filter((e) => e.status === 'available').length;
  const busyEditors = EDITORS.filter((e) => e.status === 'busy').length;
  const offlineEditors = EDITORS.filter((e) => e.status === 'offline').length;
  const totalCurrentJobs = EDITORS.reduce((sum, e) => sum + e.currentJobs, 0);
  const totalCapacity = EDITORS.reduce((sum, e) => sum + e.maxJobs, 0);
  const avgQualityScore = EDITORS.reduce((sum, e) => sum + e.qualityScore, 0) / totalEditors;
  
  return {
    totalEditors,
    availableEditors,
    busyEditors,
    offlineEditors,
    totalCurrentJobs,
    totalCapacity,
    capacityUtilization: (totalCurrentJobs / totalCapacity) * 100,
    avgQualityScore,
  };
}

/**
 * Schätze Bearbeitungszeit basierend auf Bildanzahl
 */
export function estimateEditingTime(imageCount: number): number {
  // Durchschnittlich 15 Minuten pro Bild
  const minutesPerImage = 15;
  const totalMinutes = imageCount * minutesPerImage;
  return Math.ceil(totalMinutes / 60); // Rückgabe in Stunden
}

/**
 * Berechne Deadline basierend auf Priorität
 */
export function calculateDeadline(
  priority: 'normal' | 'hoch' | 'dringend',
  uploadDate: Date = new Date()
): Date {
  const deadline = new Date(uploadDate);
  
  switch (priority) {
    case 'dringend':
      deadline.setHours(deadline.getHours() + 24); // 24h
      break;
    case 'hoch':
      deadline.setHours(deadline.getHours() + 48); // 48h
      break;
    case 'normal':
      deadline.setHours(deadline.getHours() + 72); // 72h
      break;
  }
  
  return deadline;
}

/**
 * Validiere Editor-Zuweisung
 */
export function validateAssignment(
  editorId: string,
  jobPriority: 'normal' | 'hoch' | 'dringend'
): { valid: boolean; warnings: string[] } {
  const editor = getEditorById(editorId);
  const warnings: string[] = [];
  
  if (!editor) {
    return { valid: false, warnings: ['Editor nicht gefunden'] };
  }
  
  if (editor.status === 'offline') {
    warnings.push('Editor ist offline');
  }
  
  if (editor.currentJobs >= editor.maxJobs) {
    warnings.push('Editor hat maximale Kapazität erreicht');
  }
  
  if (jobPriority === 'dringend' && editor.avgTurnaroundHours > 24) {
    warnings.push('Editor hat längere durchschnittliche Bearbeitungszeit (>24h)');
  }
  
  if (editor.status === 'busy' && editor.currentJobs >= editor.maxJobs * 0.8) {
    warnings.push('Editor ist nahezu ausgelastet');
  }
  
  return {
    valid: warnings.length === 0 || (warnings.length === 1 && warnings[0].includes('nahezu')),
    warnings,
  };
}

/**
 * Workload-Umverteilung (wenn Editor überlastet)
 */
export function suggestReassignment(overloadedEditorId: string): Editor[] {
  const overloadedEditor = getEditorById(overloadedEditorId);
  if (!overloadedEditor) return [];
  
  // Finde Editoren mit freier Kapazität und ähnlicher Spezialisierung
  return EDITORS.filter((editor) => {
    if (editor.id === overloadedEditorId) return false;
    if (editor.status === 'offline') return false;
    if (editor.currentJobs >= editor.maxJobs * 0.7) return false;
    
    // Hat ähnliche Spezialisierung?
    const hasCommonSpecialization = editor.specialization.some((spec) =>
      overloadedEditor.specialization.includes(spec)
    );
    
    return hasCommonSpecialization;
  }).sort((a, b) => a.currentJobs - b.currentJobs);
}
