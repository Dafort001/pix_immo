/**
 * Gallery Router Utility
 * 
 * Entscheidet basierend auf der Upload-Quelle, in welche Galerie
 * bearbeitete Bilder ausgeliefert werden:
 * 
 * - App-Uploads → pixcapture.app Kundengalerie (Self-Service)
 * - Professional-Uploads → pix.immo Kundengalerie (Professional)
 */

export type UploadSource = 'app' | 'professional';

export interface GalleryDestination {
  type: 'app' | 'professional';
  url: string;
  customerPortal: string;
  apiEndpoint: string;
}

export interface JobRouting {
  jobId: string;
  source: UploadSource;
  customer: string;
  deliveryDestination: GalleryDestination;
}

/**
 * Bestimmt die Ziel-Galerie basierend auf der Upload-Quelle
 */
export function getGalleryDestination(source: UploadSource, jobId: string): GalleryDestination {
  if (source === 'app') {
    return {
      type: 'app',
      url: `https://pixcapture.app/gallery/${jobId}`,
      customerPortal: 'https://pixcapture.app/app-gallery',
      apiEndpoint: `/api/galleries/app/${jobId}/deliver`,
    };
  } else {
    return {
      type: 'professional',
      url: `https://pix.immo/galerie/${jobId}`,
      customerPortal: 'https://pix.immo/dashboard',
      apiEndpoint: `/api/galleries/professional/${jobId}/deliver`,
    };
  }
}

/**
 * Erstellt Routing-Informationen für einen Job
 */
export function createJobRouting(
  jobId: string,
  source: UploadSource,
  customer: string
): JobRouting {
  return {
    jobId,
    source,
    customer,
    deliveryDestination: getGalleryDestination(source, jobId),
  };
}

/**
 * Generiert Push-Nachricht basierend auf Galerie-Typ
 */
export function getPushNotificationConfig(source: UploadSource) {
  if (source === 'app') {
    return {
      title: 'pix.immo',
      messageDE: 'Deine bearbeiteten Fotos sind jetzt in deiner Galerie verfügbar.',
      messageEN: 'Your edited photos are now available in your gallery.',
      deeplink: 'pixcapture://app-gallery',
    };
  } else {
    return {
      title: 'pix.immo',
      messageDE: 'Ihre professionellen Aufnahmen wurden bearbeitet und sind jetzt verfügbar.',
      messageEN: 'Your professional photos have been edited and are now available.',
      deeplink: 'pixcapture://dashboard',
    };
  }
}

/**
 * Validiert ob ein Job in die richtige Pipeline geroutet wurde
 */
export function validateJobRouting(jobId: string, source: UploadSource): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Job-ID Format Check
  if (!jobId.match(/^\d{8}-[A-Z0-9]{5}$/)) {
    warnings.push('Job-ID Format ungültig (erwartet: YYYYMMDD-XXXXX)');
  }

  // Source Check
  if (source !== 'app' && source !== 'professional') {
    warnings.push('Ungültige Upload-Quelle');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Metadata für Galerie-Organisation
 */
export interface GalleryMetadata {
  source: UploadSource;
  jobId: string;
  customerEmail: string;
  deliveryDate?: string;
  imageCount: number;
  tags: string[];
}

export function createGalleryMetadata(
  source: UploadSource,
  jobId: string,
  customerEmail: string,
  imageCount: number
): GalleryMetadata {
  return {
    source,
    jobId,
    customerEmail,
    deliveryDate: new Date().toISOString(),
    imageCount,
    tags: source === 'app' ? ['self-service', 'app-upload'] : ['professional', 'pix-immo'],
  };
}
