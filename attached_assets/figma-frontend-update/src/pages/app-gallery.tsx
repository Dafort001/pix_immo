import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Upload, Check, Layers, Camera, Clock, Edit3, Tag, X } from 'lucide-react';
import { AppNavigationBar } from '../components/AppNavigationBar';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { toast } from 'sonner';

interface PhotoStack {
  stackId: string;
  shots: Photo[];
  thumbnail: Photo;
  deviceType: 'pro' | 'standard';
  format: 'DNG' | 'JPG';
  timestamp: Date;
  room: string;
  selected: boolean;
  orientation?: 'landscape' | 'portrait';
}

interface Photo {
  id: string;
  stackId: string;
  stackIndex: number;
  stackTotal: number;
  exposureValue: number;
  fileFormat: string;
  realShutterSpeed: string;
  room: string;
  timestamp: Date;
  thumbnailUrl: string;
}

// Room Types (same as in camera)
const ROOM_TYPES = [
  { id: 'general', name: 'Allgemein', icon: '📍' },
  { id: 'living', name: 'Wohnzimmer', icon: '🛋️' },
  { id: 'dining', name: 'Esszimmer', icon: '🍽️' },
  { id: 'kitchen', name: 'Küche', icon: '🍳' },
  { id: 'bedroom', name: 'Schlafzimmer', icon: '🛏️' },
  { id: 'bedroom_master', name: 'Hauptschlafzimmer', icon: '👑' },
  { id: 'bedroom_child', name: 'Kinderzimmer', icon: '🧸' },
  { id: 'bedroom_guest', name: 'Gästezimmer', icon: '🚪' },
  { id: 'bathroom', name: 'Badezimmer', icon: '🚿' },
  { id: 'bathroom_master', name: 'Hauptbadezimmer', icon: '🛁' },
  { id: 'bathroom_guest', name: 'Gästebad', icon: '🚽' },
  { id: 'wc', name: 'WC', icon: '🚻' },
  { id: 'office', name: 'Arbeitszimmer', icon: '💼' },
  { id: 'hallway', name: 'Flur', icon: '🚶' },
  { id: 'entrance', name: 'Eingangsbereich', icon: '🏠' },
  { id: 'balcony', name: 'Balkon', icon: '🌤️' },
  { id: 'terrace', name: 'Terrasse', icon: '🌿' },
  { id: 'garden', name: 'Garten', icon: '🌳' },
  { id: 'garage', name: 'Garage', icon: '🚗' },
  { id: 'carport', name: 'Carport', icon: '🅿️' },
  { id: 'basement', name: 'Keller', icon: '⬇️' },
  { id: 'attic', name: 'Dachboden', icon: '⬆️' },
  { id: 'storage', name: 'Abstellraum', icon: '📦' },
  { id: 'laundry', name: 'Waschraum', icon: '🧺' },
  { id: 'utility', name: 'Hauswirtschaftsraum', icon: '🧹' },
  { id: 'pantry', name: 'Speisekammer', icon: '🥫' },
  { id: 'walk_in_closet', name: 'Ankleidezimmer', icon: '👔' },
  { id: 'gym', name: 'Fitnessraum', icon: '💪' },
  { id: 'sauna', name: 'Sauna', icon: '🧖' },
  { id: 'pool', name: 'Pool', icon: '🏊' },
  { id: 'exterior', name: 'Außenansicht', icon: '🏘️' }
];

export default function AppGallery() {
  const [, setLocation] = useLocation();
  const [stacks, setStacks] = useState<PhotoStack[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [expandedStack, setExpandedStack] = useState<string | null>(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [editingStackIds, setEditingStackIds] = useState<string[]>([]);

  const SAFE_AREA_TOP = 59;
  const SAFE_AREA_BOTTOM = 34;

  // Helper: Save stacks to localStorage
  const saveStacksToStorage = (updatedStacks: PhotoStack[]) => {
    try {
      localStorage.setItem('pix-captured-stacks', JSON.stringify(updatedStacks));
    } catch (e) {
      console.error('Failed to save stacks to localStorage:', e);
    }
  };

  // Load stacks from localStorage (captured from camera) or demo data
  useEffect(() => {
    // Try to load from localStorage first
    const storedStacks = localStorage.getItem('pix-captured-stacks');
    
    if (storedStacks) {
      try {
        const parsed = JSON.parse(storedStacks);
        // Convert timestamp strings back to Date objects
        const stacksWithDates = parsed.map((stack: any) => ({
          ...stack,
          timestamp: new Date(stack.timestamp),
          thumbnail: {
            ...stack.thumbnail,
            timestamp: new Date(stack.thumbnail.timestamp)
          },
          shots: stack.shots.map((shot: any) => ({
            ...shot,
            timestamp: new Date(shot.timestamp)
          }))
        }));
        setStacks(stacksWithDates);
        return;
      } catch (e) {
        console.error('Failed to parse stored stacks:', e);
      }
    }

    // Fallback: Load demo stacks for preview/testing (15 realistic stacks)
    const demoStacks: PhotoStack[] = [
      // 1. Wohnzimmer - Pro/DNG
      {
        stackId: 'stack_20251105T143022_a7f3k9',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:30:22'),
        room: 'Wohnzimmer',
        selected: false,
        thumbnail: {
          id: 'photo_1_2',
          stackId: 'stack_20251105T143022_a7f3k9',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/125s',
          room: 'Wohnzimmer',
          timestamp: new Date('2025-11-05T14:30:22'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_1_${i+1}`,
          stackId: 'stack_20251105T143022_a7f3k9',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(125 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Wohnzimmer',
          timestamp: new Date('2025-11-05T14:30:22'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400'
        }))
      },
      // 2. Küche - Standard/JPG
      {
        stackId: 'stack_20251105T143145_b2k8p4',
        deviceType: 'standard',
        format: 'JPG',
        timestamp: new Date('2025-11-05T14:31:45'),
        room: 'Küche',
        selected: false,
        thumbnail: {
          id: 'photo_2_3',
          stackId: 'stack_20251105T143145_b2k8p4',
          stackIndex: 3,
          stackTotal: 5,
          exposureValue: 0,
          fileFormat: 'JPG',
          realShutterSpeed: '1/60s',
          room: 'Küche',
          timestamp: new Date('2025-11-05T14:31:45'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400'
        },
        shots: Array.from({ length: 5 }, (_, i) => ({
          id: `photo_2_${i+1}`,
          stackId: 'stack_20251105T143145_b2k8p4',
          stackIndex: i + 1,
          stackTotal: 5,
          exposureValue: i - 2,
          fileFormat: 'JPG',
          realShutterSpeed: `1/${Math.round(60 * Math.pow(2, -(i-2)))}s`,
          room: 'Küche',
          timestamp: new Date('2025-11-05T14:31:45'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400'
        }))
      },
      // 3. Esszimmer - Pro/DNG
      {
        stackId: 'stack_20251105T143330_c3m9q5',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:33:30'),
        room: 'Esszimmer',
        selected: false,
        thumbnail: {
          id: 'photo_3_2',
          stackId: 'stack_20251105T143330_c3m9q5',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/100s',
          room: 'Esszimmer',
          timestamp: new Date('2025-11-05T14:33:30'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_3_${i+1}`,
          stackId: 'stack_20251105T143330_c3m9q5',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(100 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Esszimmer',
          timestamp: new Date('2025-11-05T14:33:30'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400'
        }))
      },
      // 4. Hauptschlafzimmer - Pro/DNG
      {
        stackId: 'stack_20251105T143512_d4n1r6',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:35:12'),
        room: 'Hauptschlafzimmer',
        selected: false,
        thumbnail: {
          id: 'photo_4_2',
          stackId: 'stack_20251105T143512_d4n1r6',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/80s',
          room: 'Hauptschlafzimmer',
          timestamp: new Date('2025-11-05T14:35:12'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_4_${i+1}`,
          stackId: 'stack_20251105T143512_d4n1r6',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(80 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Hauptschlafzimmer',
          timestamp: new Date('2025-11-05T14:35:12'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400'
        }))
      },
      // 5. Hauptbadezimmer - Pro/DNG - PORTRAIT
      {
        stackId: 'stack_20251105T143705_e5p2s7',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:37:05'),
        room: 'Hauptbadezimmer',
        selected: false,
        orientation: 'portrait',
        thumbnail: {
          id: 'photo_5_2',
          stackId: 'stack_20251105T143705_e5p2s7',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/60s',
          room: 'Hauptbadezimmer',
          timestamp: new Date('2025-11-05T14:37:05'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1727388751342-d667496f3b82?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_5_${i+1}`,
          stackId: 'stack_20251105T143705_e5p2s7',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(60 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Hauptbadezimmer',
          timestamp: new Date('2025-11-05T14:37:05'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1727388751342-d667496f3b82?w=400'
        }))
      },
      // 6. Kinderzimmer - Standard/JPG
      {
        stackId: 'stack_20251105T143850_f6q3t8',
        deviceType: 'standard',
        format: 'JPG',
        timestamp: new Date('2025-11-05T14:38:50'),
        room: 'Kinderzimmer',
        selected: false,
        thumbnail: {
          id: 'photo_6_3',
          stackId: 'stack_20251105T143850_f6q3t8',
          stackIndex: 3,
          stackTotal: 5,
          exposureValue: 0,
          fileFormat: 'JPG',
          realShutterSpeed: '1/100s',
          room: 'Kinderzimmer',
          timestamp: new Date('2025-11-05T14:38:50'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400'
        },
        shots: Array.from({ length: 5 }, (_, i) => ({
          id: `photo_6_${i+1}`,
          stackId: 'stack_20251105T143850_f6q3t8',
          stackIndex: i + 1,
          stackTotal: 5,
          exposureValue: i - 2,
          fileFormat: 'JPG',
          realShutterSpeed: `1/${Math.round(100 * Math.pow(2, -(i-2)))}s`,
          room: 'Kinderzimmer',
          timestamp: new Date('2025-11-05T14:38:50'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400'
        }))
      },
      // 7. Arbeitszimmer - Pro/DNG
      {
        stackId: 'stack_20251105T144025_g7r4u9',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:40:25'),
        room: 'Arbeitszimmer',
        selected: false,
        thumbnail: {
          id: 'photo_7_2',
          stackId: 'stack_20251105T144025_g7r4u9',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/125s',
          room: 'Arbeitszimmer',
          timestamp: new Date('2025-11-05T14:40:25'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_7_${i+1}`,
          stackId: 'stack_20251105T144025_g7r4u9',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(125 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Arbeitszimmer',
          timestamp: new Date('2025-11-05T14:40:25'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400'
        }))
      },
      // 8. Flur - Pro/DNG
      {
        stackId: 'stack_20251105T144210_h8s5v1',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:42:10'),
        room: 'Flur',
        selected: false,
        thumbnail: {
          id: 'photo_8_2',
          stackId: 'stack_20251105T144210_h8s5v1',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/60s',
          room: 'Flur',
          timestamp: new Date('2025-11-05T14:42:10'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_8_${i+1}`,
          stackId: 'stack_20251105T144210_h8s5v1',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(60 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Flur',
          timestamp: new Date('2025-11-05T14:42:10'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400'
        }))
      },
      // 9. Eingangsbereich - Pro/DNG - PORTRAIT
      {
        stackId: 'stack_20251105T144345_i9t6w2',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:43:45'),
        room: 'Eingangsbereich',
        selected: false,
        orientation: 'portrait',
        thumbnail: {
          id: 'photo_9_2',
          stackId: 'stack_20251105T144345_i9t6w2',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/80s',
          room: 'Eingangsbereich',
          timestamp: new Date('2025-11-05T14:43:45'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1760623146151-2656defca5c4?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_9_${i+1}`,
          stackId: 'stack_20251105T144345_i9t6w2',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(80 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Eingangsbereich',
          timestamp: new Date('2025-11-05T14:43:45'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1760623146151-2656defca5c4?w=400'
        }))
      },
      // 10. Gästebad - Standard/JPG
      {
        stackId: 'stack_20251105T144520_j1u7x3',
        deviceType: 'standard',
        format: 'JPG',
        timestamp: new Date('2025-11-05T14:45:20'),
        room: 'Gästebad',
        selected: false,
        thumbnail: {
          id: 'photo_10_3',
          stackId: 'stack_20251105T144520_j1u7x3',
          stackIndex: 3,
          stackTotal: 5,
          exposureValue: 0,
          fileFormat: 'JPG',
          realShutterSpeed: '1/60s',
          room: 'Gästebad',
          timestamp: new Date('2025-11-05T14:45:20'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400'
        },
        shots: Array.from({ length: 5 }, (_, i) => ({
          id: `photo_10_${i+1}`,
          stackId: 'stack_20251105T144520_j1u7x3',
          stackIndex: i + 1,
          stackTotal: 5,
          exposureValue: i - 2,
          fileFormat: 'JPG',
          realShutterSpeed: `1/${Math.round(60 * Math.pow(2, -(i-2)))}s`,
          room: 'Gästebad',
          timestamp: new Date('2025-11-05T14:45:20'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400'
        }))
      },
      // 11. Balkon - Pro/DNG
      {
        stackId: 'stack_20251105T144705_k2v8y4',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:47:05'),
        room: 'Balkon',
        selected: false,
        thumbnail: {
          id: 'photo_11_2',
          stackId: 'stack_20251105T144705_k2v8y4',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/250s',
          room: 'Balkon',
          timestamp: new Date('2025-11-05T14:47:05'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_11_${i+1}`,
          stackId: 'stack_20251105T144705_k2v8y4',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(250 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Balkon',
          timestamp: new Date('2025-11-05T14:47:05'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400'
        }))
      },
      // 12. Außenansicht 1 - Pro/DNG
      {
        stackId: 'stack_20251105T144850_l3w9z5',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:48:50'),
        room: 'Außenansicht',
        selected: false,
        thumbnail: {
          id: 'photo_12_2',
          stackId: 'stack_20251105T144850_l3w9z5',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/320s',
          room: 'Außenansicht',
          timestamp: new Date('2025-11-05T14:48:50'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_12_${i+1}`,
          stackId: 'stack_20251105T144850_l3w9z5',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(320 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Außenansicht',
          timestamp: new Date('2025-11-05T14:48:50'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'
        }))
      },
      // 13. Garten - Pro/DNG
      {
        stackId: 'stack_20251105T145035_m4x1a6',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:50:35'),
        room: 'Garten',
        selected: false,
        thumbnail: {
          id: 'photo_13_2',
          stackId: 'stack_20251105T145035_m4x1a6',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/200s',
          room: 'Garten',
          timestamp: new Date('2025-11-05T14:50:35'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_13_${i+1}`,
          stackId: 'stack_20251105T145035_m4x1a6',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(200 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Garten',
          timestamp: new Date('2025-11-05T14:50:35'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400'
        }))
      },
      // 14. Terrasse - Standard/JPG
      {
        stackId: 'stack_20251105T145220_n5y2b7',
        deviceType: 'standard',
        format: 'JPG',
        timestamp: new Date('2025-11-05T14:52:20'),
        room: 'Terrasse',
        selected: false,
        thumbnail: {
          id: 'photo_14_3',
          stackId: 'stack_20251105T145220_n5y2b7',
          stackIndex: 3,
          stackTotal: 5,
          exposureValue: 0,
          fileFormat: 'JPG',
          realShutterSpeed: '1/160s',
          room: 'Terrasse',
          timestamp: new Date('2025-11-05T14:52:20'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
        },
        shots: Array.from({ length: 5 }, (_, i) => ({
          id: `photo_14_${i+1}`,
          stackId: 'stack_20251105T145220_n5y2b7',
          stackIndex: i + 1,
          stackTotal: 5,
          exposureValue: i - 2,
          fileFormat: 'JPG',
          realShutterSpeed: `1/${Math.round(160 * Math.pow(2, -(i-2)))}s`,
          room: 'Terrasse',
          timestamp: new Date('2025-11-05T14:52:20'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
        }))
      },
      // 15. Außenansicht 2 - Pro/DNG
      {
        stackId: 'stack_20251105T145405_o6z3c8',
        deviceType: 'pro',
        format: 'DNG',
        timestamp: new Date('2025-11-05T14:54:05'),
        room: 'Außenansicht',
        selected: false,
        thumbnail: {
          id: 'photo_15_2',
          stackId: 'stack_20251105T145405_o6z3c8',
          stackIndex: 2,
          stackTotal: 3,
          exposureValue: 0,
          fileFormat: 'DNG',
          realShutterSpeed: '1/400s',
          room: 'Außenansicht',
          timestamp: new Date('2025-11-05T14:54:05'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
        },
        shots: Array.from({ length: 3 }, (_, i) => ({
          id: `photo_15_${i+1}`,
          stackId: 'stack_20251105T145405_o6z3c8',
          stackIndex: i + 1,
          stackTotal: 3,
          exposureValue: (i - 1) * 2,
          fileFormat: 'DNG',
          realShutterSpeed: `1/${Math.round(400 * Math.pow(2, -((i-1)*2)))}s`,
          room: 'Außenansicht',
          timestamp: new Date('2025-11-05T14:54:05'),
          thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
        }))
      }
    ];

    setStacks(demoStacks);
  }, []);

  const toggleSelection = (stackId: string) => {
    setStacks(stacks.map(stack => 
      stack.stackId === stackId 
        ? { ...stack, selected: !stack.selected }
        : stack
    ));
  };

  const selectAll = () => {
    setStacks(stacks.map(stack => ({ ...stack, selected: true })));
  };

  const deselectAll = () => {
    setStacks(stacks.map(stack => ({ ...stack, selected: false })));
  };

  const selectedCount = stacks.filter(s => s.selected).length;
  const selectedStacks = stacks.filter(s => s.selected);

  const handleUpload = () => {
    if (selectedCount === 0) {
      toast.error('Bitte wählen Sie mindestens einen Stack aus');
      return;
    }

    // Store selected stacks for upload page
    localStorage.setItem('uploadStacks', JSON.stringify(selectedStacks));
    setLocation('/app/upload');
  };

  const toggleStackExpansion = (stackId: string) => {
    setExpandedStack(expandedStack === stackId ? null : stackId);
  };

  // Edit Mode Functions
  const toggleEditSelection = (stackId: string) => {
    setEditingStackIds(prev => 
      prev.includes(stackId)
        ? prev.filter(id => id !== stackId)
        : [...prev, stackId]
    );
  };

  const selectAllForEdit = () => {
    setEditingStackIds(stacks.map(s => s.stackId));
  };

  const deselectAllEdit = () => {
    setEditingStackIds([]);
  };

  const handleRoomAssignment = (roomId: string) => {
    if (editingStackIds.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Stack aus');
      return;
    }

    const room = ROOM_TYPES.find(r => r.id === roomId);
    if (!room) return;

    // Update room for selected stacks
    const updatedStacks = stacks.map(stack => 
      editingStackIds.includes(stack.stackId)
        ? { 
            ...stack, 
            room: room.name,
            shots: stack.shots.map(shot => ({ ...shot, room: room.name })),
            thumbnail: { ...stack.thumbnail, room: room.name }
          }
        : stack
    );

    setStacks(updatedStacks);
    saveStacksToStorage(updatedStacks);

    toast.success(`${editingStackIds.length} Stapel zu "${room.name}" zugeordnet`);
    setShowRoomPicker(false);
    setEditingStackIds([]);
    setEditMode(false);
  };

  return (
    <IPhoneFrame>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}
      >
        {/* Content */}
        <div
          style={{
            paddingTop: SAFE_AREA_TOP + 16,
            paddingBottom: SAFE_AREA_BOTTOM + 72 + 16,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ padding: '0 16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button
                onClick={() => setLocation('/app')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#74A4EA',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ArrowLeft size={20} />
                <span style={{ fontSize: '16px', fontWeight: '500' }}>Zurück</span>
              </button>

              {selectionMode && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={selectAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#74A4EA',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Alle
                  </button>
                  <button
                    onClick={deselectAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8E9094',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Keine
                  </button>
                </div>
              )}

              {editMode && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={selectAllForEdit}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C9B55A',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Alle
                  </button>
                  <button
                    onClick={deselectAllEdit}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8E9094',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Keine
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0', color: '#1A1A1C' }}>
                  Galerie
                </h1>
                <p style={{ fontSize: '14px', color: '#8E9094', margin: 0 }}>
                  {stacks.length} Stapel · {stacks.reduce((acc, s) => acc + s.shots.length, 0)} Fotos
                </p>
              </div>

              {!selectionMode && !editMode ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      background: 'none',
                      border: '1px solid #C9B55A',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      color: '#C9B55A',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Edit3 size={16} />
                    Raum
                  </button>
                  <button
                    onClick={() => setSelectionMode(true)}
                    style={{
                      background: '#74A4EA',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setEditMode(false);
                    deselectAll();
                    deselectAllEdit();
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid #8E9094',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    color: '#8E9094',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>
              )}
            </div>
          </div>

          {/* Stacks Grid */}
          <div
            style={{
              flex: 1,
              padding: '0 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              alignContent: 'start',
            }}
          >
            {stacks.map((stack) => (
              <div key={stack.stackId}>
                {/* Stack Card */}
                <div
                  onClick={() => {
                    if (selectionMode) {
                      toggleSelection(stack.stackId);
                    } else if (editMode) {
                      toggleEditSelection(stack.stackId);
                    } else {
                      toggleStackExpansion(stack.stackId);
                    }
                  }}
                  style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: stack.selected 
                      ? '2px solid #74A4EA' 
                      : editingStackIds.includes(stack.stackId)
                      ? '2px solid #C9B55A'
                      : '1px solid #E5E5E5',
                    background: '#F6F6F6',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      aspectRatio: stack.orientation === 'portrait' ? '3/4' : '4/3',
                      backgroundImage: `url(${stack.thumbnail.thumbnailUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Stack Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <Layers size={8} color="#FFFFFF" />
                      <span style={{ fontSize: '8px', fontWeight: '600', color: '#FFFFFF' }}>
                        {stack.shots.length}×
                      </span>
                    </div>

                    {/* Device Type Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: stack.deviceType === 'pro' 
                          ? 'rgba(100, 191, 73, 0.9)' 
                          : 'rgba(142, 144, 148, 0.9)',
                        borderRadius: '3px',
                        padding: '2px 4px',
                        fontSize: '8px',
                        fontWeight: '700',
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                      }}
                    >
                      {stack.deviceType === 'pro' ? 'Pro' : 'Std'}
                    </div>

                    {/* Selection Checkmark */}
                    {selectionMode && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: stack.selected ? '#74A4EA' : 'rgba(255, 255, 255, 0.3)',
                          border: stack.selected ? 'none' : '2px solid #FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {stack.selected && <Check size={14} color="#FFFFFF" />}
                      </div>
                    )}

                    {/* Edit Mode Checkmark */}
                    {editMode && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: editingStackIds.includes(stack.stackId) ? '#C9B55A' : 'rgba(255, 255, 255, 0.3)',
                          border: editingStackIds.includes(stack.stackId) ? 'none' : '2px solid #FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {editingStackIds.includes(stack.stackId) && <Check size={14} color="#FFFFFF" />}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#1A1A1C', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '11px' }}>
                        {ROOM_TYPES.find(r => r.name === stack.room)?.icon || '📍'}
                      </span>
                      {stack.room}
                    </div>
                    <div style={{ fontSize: '9px', color: '#8E9094', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Clock size={8} />
                      {stack.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Expanded Shots */}
                {expandedStack === stack.stackId && !selectionMode && !editMode && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: '#F6F6F6',
                      borderRadius: '12px',
                      gridColumn: '1 / -1',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A1C', marginBottom: '8px' }}>
                      Belichtungsreihe
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                      {stack.shots.map((shot) => (
                        <div key={shot.id} style={{ minWidth: '100px' }}>
                          <div
                            style={{
                              width: '100px',
                              height: '75px',
                              borderRadius: '8px',
                              backgroundImage: `url(${shot.thumbnailUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative',
                              border: shot.exposureValue === 0 ? '2px solid #74A4EA' : '1px solid #E5E5E5',
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                background: 'rgba(0, 0, 0, 0.7)',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '9px',
                                fontWeight: '700',
                                color: '#FFFFFF',
                              }}
                            >
                              {shot.exposureValue > 0 ? '+' : ''}{shot.exposureValue} EV
                            </div>
                          </div>
                          <div style={{ fontSize: '10px', color: '#8E9094', marginTop: '4px', textAlign: 'center' }}>
                            {shot.realShutterSpeed}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {stacks.length === 0 && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#F6F6F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={40} color="#8E9094" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#1A1A1C' }}>
                  Keine Fotos
                </h2>
                <p style={{ fontSize: '14px', color: '#8E9094', margin: 0 }}>
                  Nutzen Sie die Kamera um Fotos aufzunehmen
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload FAB */}
        {selectionMode && selectedCount > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: SAFE_AREA_BOTTOM + 72 + 16,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#64BF49',
              borderRadius: '24px',
              padding: '14px 24px',
              boxShadow: '0 4px 12px rgba(100, 191, 73, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              zIndex: 10,
            }}
            onClick={handleUpload}
          >
            <Upload size={20} color="#FFFFFF" />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>
              {selectedCount} Stapel hochladen
            </span>
          </div>
        )}

        {/* Edit Mode FAB */}
        {editMode && editingStackIds.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: SAFE_AREA_BOTTOM + 72 + 16,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#C9B55A',
              borderRadius: '24px',
              padding: '14px 24px',
              boxShadow: '0 4px 12px rgba(201, 181, 90, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              zIndex: 10,
            }}
            onClick={() => setShowRoomPicker(true)}
          >
            <Tag size={20} color="#FFFFFF" />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>
              {editingStackIds.length} Stapel zuordnen
            </span>
          </div>
        )}

        {/* Room Picker Modal */}
        {showRoomPicker && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'flex-end',
            }}
            onClick={() => setShowRoomPicker(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                background: '#FFFFFF',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                paddingTop: '24px',
                paddingBottom: SAFE_AREA_BOTTOM + 72 + 24,
                maxHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ padding: '0 24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1C', margin: 0 }}>
                    Raum zuordnen
                  </h2>
                  <button
                    onClick={() => setShowRoomPicker(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: '#8E9094',
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
                <p style={{ fontSize: '14px', color: '#8E9094', margin: 0 }}>
                  {editingStackIds.length} Stapel ausgewählt
                </p>
              </div>

              {/* Room List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '0 24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ROOM_TYPES.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomAssignment(room.id)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: '#F6F6F6',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'left',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E5E5E5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F6F6F6';
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{room.icon}</span>
                      <span style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A1C' }}>
                        {room.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <AppNavigationBar activeRoute="/app/gallery" />
      </div>
    </IPhoneFrame>
  );
}
