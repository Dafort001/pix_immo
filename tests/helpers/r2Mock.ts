/**
 * R2 Bucket Mock for Integration Tests
 * Simulates Cloudflare R2 Binding (c.env.R2_BUCKET)
 */

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: Date;
}

export interface R2MockOptions {
  existingObjects?: string[]; // List of object keys that "exist" in R2
}

/**
 * Create a mock R2 Bucket binding
 */
export function createR2Mock(options: R2MockOptions = {}) {
  const existingObjects = new Set(options.existingObjects || []);

  return {
    /**
     * HEAD request to check if object exists
     * Returns R2Object if exists, null if not found
     */
    head: async (key: string): Promise<R2Object | null> => {
      if (existingObjects.has(key)) {
        return {
          key,
          size: 2048576, // 2MB mock size
          etag: `"${key.slice(0, 8)}"`, // Mock ETag
          uploaded: new Date(),
        };
      }
      return null;
    },

    /**
     * Add object to mock (for test setup)
     */
    addObject: (key: string) => {
      existingObjects.add(key);
    },

    /**
     * Remove object from mock (for test cleanup)
     */
    removeObject: (key: string) => {
      existingObjects.delete(key);
    },

    /**
     * Reset mock to initial state
     */
    reset: () => {
      existingObjects.clear();
      if (options.existingObjects) {
        options.existingObjects.forEach((key) => existingObjects.add(key));
      }
    },
  };
}

export type R2MockInstance = ReturnType<typeof createR2Mock>;
