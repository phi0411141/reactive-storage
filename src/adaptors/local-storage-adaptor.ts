import type { Adaptor, UnregisterFn } from '../reactive-storage-types';

export interface CustomEventDetail<T = unknown> {
  key: string;
  value: T;
}

export function createLocalStorageAdaptor(storageId: string, {crossTabs}: {crossTabs?: boolean} = {crossTabs: false}): Adaptor {
  const customEventKey = `${storageId}_STORAGE_localStorage`;

  function toKey(key: string) {
    return `${storageId}_${String(key)}`;
  }

  function fireCustomEvent(key: string, newVal: unknown) {
    const event = new CustomEvent(customEventKey, {
      detail: { key, value: newVal },
    });

    window.dispatchEvent(event);
  }

  function listenCustomEvent(callback: (val: any) => void): UnregisterFn {
    const inWindowHandler = (e: CustomEvent) => {
      callback(e.detail);
    };

    const crossTabsHandler = (e: StorageEvent) => {
      callback({
        key: e.key,
        value: e.newValue,
      });
    };

    window.addEventListener(customEventKey, inWindowHandler as EventListener);
    if (crossTabs) {
      window.addEventListener('storage', crossTabsHandler as EventListener);
    }

    return () => {
      window.removeEventListener(customEventKey, inWindowHandler as EventListener);
      if (crossTabs) {
        window.removeEventListener('storage', crossTabsHandler as EventListener);
      }
    };
  }

  return {
    get: (key) => {
      return window.localStorage.getItem(toKey(key));
    },
    set: (key, newValue) => {
      window.localStorage.setItem(toKey(key), newValue);
      fireCustomEvent(toKey(key), newValue);
    },
    remove: (key) => {
      window.localStorage.removeItem(toKey(key));
      fireCustomEvent(toKey(key), null);
    },
    onValueChanged<Value = unknown>(key: string, listener: (val: Value) => void): UnregisterFn {
      return listenCustomEvent((detail: CustomEventDetail<string>) => {
        if (toKey(key) === detail.key) {
          listener(detail.value as Value);
        }
      });
    },
  };
}
