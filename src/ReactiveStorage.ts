import type {
  Adaptor,
  InferStorageType,
  ListenerFn,
  RegisterOptions,
  StorageKey,
  UnregisterFn
} from './reactive-storage-types';
import { formatStorageKeyMap } from './utils';

export class ReactiveStorage<KeyOptions extends Record<string, StorageKey>> {
  private readonly storageKeys: KeyOptions;
  private readonly adaptor: Adaptor;

  constructor(
    adaptor: Adaptor,
    storageKeysOptions: KeyOptions,
  ) {
    this.storageKeys = formatStorageKeyMap(storageKeysOptions) as KeyOptions;
    this.adaptor = adaptor;

    this.internalGet = this.internalGet.bind(this);
    this.internalSet = this.internalSet.bind(this);
    this.toKey = this.toKey.bind(this);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.remove = this.remove.bind(this);
    this.clear = this.clear.bind(this);
    this.registerListener = this.registerListener.bind(this);
  }

  private toKey(key: any) {
    return String(key)
  }

  private internalGet<K extends keyof KeyOptions>(key: K): string | null {
    const val = this.adaptor.get(this.toKey(key));

    return val;
  }

  private internalSet<K extends keyof KeyOptions>(key: K, newVal: string) {
    this.adaptor.set(this.toKey(key), newVal);
  }

  get<K extends keyof KeyOptions>(key: K) {
    const val = this.internalGet(key);

    if (val === null) {
      return null;
    }

    const formatedVal: InferStorageType<KeyOptions[K]> = this.storageKeys[key]!.deserialize!(val);

    return formatedVal;
  }

  set<K extends keyof KeyOptions>(key: K, newVal: InferStorageType<KeyOptions[K]>): void {
    return this.internalSet(key, this.storageKeys[key]!.serialize!(newVal));
  }

  remove<K extends keyof KeyOptions>(key: K) {
    return this.adaptor.remove(this.toKey(key));
  }

  clear() {
    return Object.keys(this.storageKeys).forEach((key1) => {
      if (this.storageKeys[key1]!.persistent) {
        return;
      }

      return this.adaptor.remove(key1);
    });
  }

  registerListener<K extends keyof KeyOptions>(
      watchProp: K,
      listener: ListenerFn<InferStorageType<KeyOptions[K]> | null>,
      _options: RegisterOptions = {},
  ): null | UnregisterFn {
    const unregister = this.adaptor.onValueChanged(this.toKey(watchProp), (val: string | null) => {
      if (val === null) {
        listener(null);
        return;
      }

      const formatedVal: InferStorageType<KeyOptions[K]> | null =
          this.storageKeys[watchProp]!.deserialize!(val);

      listener(formatedVal);
    });

    return unregister;
  }
}
