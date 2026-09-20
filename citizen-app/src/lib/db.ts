import { openDB, DBSchema } from 'idb';

interface CitizenAppDB extends DBSchema {
  complaints: {
    key: string;
    value: {
      id: string;
      description: string;
      photoDataUrl?: string; // Storing as base64 for offline
      location: {
        latitude: number;
        longitude: number;
        address?: string;
      };
      timestamp: number;
      synced: number; // 0 for false, 1 for true (IndexedDB cannot index booleans)
    };
    indexes: { 'by-sync-status': number };
  };
}

export async function initDB() {
  return openDB<CitizenAppDB>('infra-pulse-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('complaints', {
        keyPath: 'id',
      });
      store.createIndex('by-sync-status', 'synced');
    },
  });
}

export async function saveComplaint(complaint: Omit<CitizenAppDB['complaints']['value'], 'synced'>) {
  const db = await initDB();
  await db.put('complaints', {
    ...complaint,
    synced: 0,
  });
}

export async function getUnsyncedComplaints() {
  const db = await initDB();
  return db.getAllFromIndex('complaints', 'by-sync-status', 0);
}

export async function markAsSynced(id: string) {
  const db = await initDB();
  const complaint = await db.get('complaints', id);
  if (complaint) {
    complaint.synced = 1;
    await db.put('complaints', complaint);
  }
}
