import { STORAGE_KEY } from './constants.js';

export class SafeBrowserStorage {
  constructor(storage) {
    if (storage !== undefined) {
      this.storage = storage;
      return;
    }
    try {
      this.storage = globalThis.localStorage;
    } catch (error) {
      this.storage = null;
      this.unavailableReason = error.message;
    }
  }

  load() {
    if (!this.storage) {
      return { available: false, value: null, error: this.unavailableReason || 'Browser storage is unavailable.' };
    }
    try {
      const saved = this.storage.getItem(STORAGE_KEY);
      if (!saved) return { available: true, value: null };
      const value = JSON.parse(saved);
      if (!value || !Array.isArray(value.tasks) || typeof value.reportingDate !== 'string') {
        return { available: true, value: null, error: 'Saved browser data was not in a recognised format.' };
      }
      return { available: true, value };
    } catch (error) {
      return { available: false, value: null, error: error.message };
    }
  }

  save(value) {
    if (!this.storage) {
      return { available: false, error: this.unavailableReason || 'Browser storage is unavailable.' };
    }
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(value));
      return { available: true };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}
