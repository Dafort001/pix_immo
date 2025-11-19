export interface JobStack {
  id: string;
  previewUrl: string;
  imageCount: 1 | 3 | 5;
  roomTypeKey: string;
  roomTypeLabel: string;
  selected: boolean;
  markedForDeletion: boolean;
  flaggedUncertain: boolean;
  orderIndex: number;
  exposures: Array<{
    url: string;
    ev: string;
  }>;
}

export interface JobMeta {
  jobId: string;
  shootCode: string;
  date: string;
  bracketSize: 1 | 3 | 5;
  rawCount: number;
  stackCount: number;
}
