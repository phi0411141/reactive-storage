import type {IStorageOptions, StorageKey, StorageKeyMap} from './reactive-storage-types';

// This is just a help to achieve typesafe
// If storage type is other than `string`, serialize & deserialize is required, else optional
export function createStorageOption<T>(options: StorageKey<T>): StorageKey<T> {
  return options;
}

export function asIs(v: any) {
  return v;
}

export function formatStorageKeyMap<T extends Record<string, IStorageOptions>>(
    storageKeys: T,
): StorageKeyMap<T> {
  const t: StorageKeyMap<T> = {} as StorageKeyMap<T>;

  Object.entries(storageKeys).forEach(([key, value]) => {
    // @ts-expect-error traditional index string as key, but it does not matter here
    t[key] = {
      ...value,
      deserialize: value.deserialize ?? asIs,
      serialize: value.serialize ?? asIs,
    };
  });

  return t;
}
