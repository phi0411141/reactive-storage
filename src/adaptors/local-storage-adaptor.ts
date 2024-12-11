import type { Adaptor, UnregisterFn } from '../reactive-storage-types';

export interface CustomEventDetail<T = unknown> {
  key: string;
  value: T;
}

export function createLocalStorageAdaptor(key: string, {crossTabs}: {crossTabs: boolean}): Adaptor {
  const customEventKey = `${key}_STORAGE_localStorage`;

  function toKey(key: string) {
    return `${key}_${String(key)}`;
  }

  function fireCustomEvent(key: string, newVal: unknown) {
    const event = new CustomEvent(customEventKey, {
      detail: { key, value: newVal },
    });

    window.dispatchEvent(event);
  }

  function listenCustomEvent(callback: (val: any) => void): UnregisterFn {
    const handler = (e: CustomEvent) => {
      callback(e.detail);
    };

    window.addEventListener(customEventKey, handler as EventListener);

    return () => {
      window.removeEventListener(customEventKey, handler as EventListener);
    };
  }

  return {
    get: (key) => {
      return window.localStorage.getItem(toKey(key));
    },
    set: (key, newValue) => {
      window.localStorage.setItem(toKey(key), newValue);
      fireCustomEvent(key, newValue);
    },
    remove: (key) => {
      window.localStorage.removeItem(key);
    },
    clear: () => {
      window.localStorage.clear();
    },
    onValueChanged<Value = unknown>(key: string, listener: (val: Value) => void): UnregisterFn {
      return listenCustomEvent((detail: CustomEventDetail<string>) => {
        if (key === detail.key) {
          listener(detail.value as Value);
        }
      });
    },
  };
}
