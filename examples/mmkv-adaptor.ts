// @ts-nocheck
import { MMKV } from 'react-native-mmkv';

import type { Adaptor, UnregisterFn } from '@phi0411141/reactive-storage';


export const createMMKVAdaptor = (storageKey?: string): Adaptor => {
  const _storage = new MMKV({
    id: storageKey,
  });
  const listeners = new Set<(...args: any[]) => any>();

  const get = (key: string) => _storage.getString(key) ?? null;
  _storage.addOnValueChangedListener((changedKey) => {
    listeners.forEach((listener) => listener(changedKey));
  });

  return {
    get,
    set: (key: string, newValue: string | null) => {
      if (newValue === null) {
        return _storage.delete(key);
      }

      return _storage.set(key, newValue);
    },
    clear: () => _storage.clearAll(),
    remove: (key: string) => _storage.delete(key),
    onValueChanged<Value>(key: string, callback: (val: Value) => void): UnregisterFn {
      const enhancedFn = (changedKey: string) => {
        if (changedKey === key) {
          callback(get(key) as Value);
        }
      };

      listeners.add(enhancedFn);

      return () => {
        listeners.delete(enhancedFn);
      };
    },
  };
};
