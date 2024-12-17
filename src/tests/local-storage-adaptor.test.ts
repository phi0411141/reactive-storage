import { createLocalStorageAdaptor } from '../adaptors/local-storage-adaptor';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('LocalStorageAdaptor', () => {
  const storageId = 'test';
  const testKey = 'testKey';
  const testValue = 'testValue';

  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  afterEach(() => {
    // Clean up event listeners
    vi.restoreAllMocks();
  });

  describe('Basic Storage Operations', () => {
    it('should store and retrieve values', () => {
      const adaptor = createLocalStorageAdaptor(storageId);
      
      adaptor.set(testKey, testValue);
      expect(adaptor.get(testKey)).toBe(testValue);
    });

    it('should remove values', () => {
      const adaptor = createLocalStorageAdaptor(storageId);
      
      adaptor.set(testKey, testValue);
      adaptor.remove(testKey);
      expect(adaptor.get(testKey)).toBeNull();
    });

    it('should prefix keys with storageId', () => {
      const adaptor = createLocalStorageAdaptor(storageId);
      
      adaptor.set(testKey, testValue);
      expect(window.localStorage.getItem(`${storageId}_${testKey}`)).toBe(testValue);
    });
  });

  describe('Event Handling', () => {
    it('should trigger value changed event when value is set', () => {
      const adaptor = createLocalStorageAdaptor(storageId);
      const listener = vi.fn();
      
      adaptor.onValueChanged(testKey, listener);
      adaptor.set(testKey, testValue);
      
      expect(listener).toHaveBeenCalledWith(testValue);
    });

    it('should trigger value changed event when value is removed', () => {
      const adaptor = createLocalStorageAdaptor(storageId);
      const listener = vi.fn();
      
      adaptor.set(testKey, testValue);
      adaptor.onValueChanged(testKey, listener);
      adaptor.remove(testKey);
      
      expect(listener).toHaveBeenCalledWith(null);
    });

    it('should unregister listener when unregister function is called', () => {
      const adaptor = createLocalStorageAdaptor(storageId);
      const listener = vi.fn();
      
      const unregister = adaptor.onValueChanged(testKey, listener);
      unregister();
      adaptor.set(testKey, testValue);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Cross-Tab Communication', () => {
    it('should listen to storage events from other tabs when crossTabs is true', () => {
      const adaptor = createLocalStorageAdaptor(storageId, { crossTabs: true });
      const listener = vi.fn();
      
      adaptor.onValueChanged(testKey, listener);
      
      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: `${storageId}_${testKey}`,
        newValue: testValue,
      });
      window.dispatchEvent(storageEvent);
      
      expect(listener).toHaveBeenCalled();
    });

    it('should not listen to storage events when crossTabs is false', () => {
      const adaptor = createLocalStorageAdaptor(storageId, { crossTabs: false });
      const listener = vi.fn();
      
      adaptor.onValueChanged(testKey, listener);
      
      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: `${storageId}_${testKey}`,
        newValue: testValue,
      });
      window.dispatchEvent(storageEvent);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
}); 